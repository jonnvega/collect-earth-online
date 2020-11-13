(ns org.openforis.ceo.server
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.tools.cli  :refer [parse-opts]]
            [ring.adapter.jetty :refer [run-jetty]]
            [org.openforis.ceo.handler :refer [development-app production-app]]
            [org.openforis.ceo.logging :refer [log-str]]))

(defonce server           (atom nil))
(defonce clean-up-service (atom nil))

(def expires-in "1 hour in msecs" (* 1000 60 60))

(defn- expired? [last-mod-time]
  (> (- (System/currentTimeMillis) last-mod-time) expires-in))

(defn- delete-tmp []
  (log-str "Removing temp files.")
  (let [tmp-dir (System/getProperty "java.io.tmpdir")
        dirs    (filter #(and (.isDirectory %)
                              (str/includes? % "ceo-tmp")
                              (expired? (.lastModified %)))
                        (.listFiles (io/file tmp-dir)))]
    (doseq [d    dirs
            file (reverse (file-seq d))]
      (io/delete-file file))))

(defn- start-clean-up-service! []
  (log-str "Starting temp file removal service.")
  (future
    (while true
      (Thread/sleep expires-in)
      (try (delete-tmp)
           (catch Exception _)))))

(def cli-options
  [["-p" "--http-port PORT" "Port for http, default 8080"
    :default 8080
    :parse-fn #(if (int? %) % (Integer/parseInt %))
    :validate [#(< 0 % 0x10000) "Must be a number between 0 and 65536"]]
   ["-P" "--https-port PORT" "Port for https (e.g. 8443)"
    :parse-fn #(if (int? %) % (Integer/parseInt %))
    :validate [#(< 0 % 0x10000) "Must be a number between 0 and 65536"]]
   ["-m" "--mode MODE" "Production (prod) or development (dev) mode, default prod"
    :default "prod"
    :validate [#{"prod" "dev"} "Must be \"prod\" or \"dev\""]]])

(defn start-server! [& args]
  (let [{:keys [options summary errors]} (parse-opts args cli-options)]
    (if (seq errors)
      (do
        (run! println errors)
        (println (str "Usage:\n" summary)))
      (let [mode       (:mode options)
            has-key?   (.exists (io/file "./.key/keystore.pkcs12"))
            handler    (if (= mode "prod")
                         #'production-app
                         #'development-app)
            https-port (:https-port options)
            config     (merge
                        {:port  (:http-port options)
                         :join? false}
                        (when (and has-key? https-port)
                          {:ssl?          true
                           :ssl-port      https-port
                           :keystore      "./.key/keystore.pkcs12"
                           :keystore-type "pkcs12"
                           :key-password  "foobar"}))]
        (if (and (not has-key?) https-port)
          (println "ERROR:\n"
                   "  An SSL key is required if an HTTPS port is specified.\n"
                   "  Create an SSL key for HTTPS or run without the --https-port (-P) option.")
          (do (reset! server (run-jetty handler config))
              (reset! clean-up-service (start-clean-up-service!))))))))

(defn stop-server! []
  (when @clean-up-service
    (future-cancel @clean-up-service)
    (reset! clean-up-service nil))
  (when @server
    (.stop @server)
    (reset! server nil)))

(def -main start-server!)