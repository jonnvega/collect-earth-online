package org.openforis.ceo;

import static org.openforis.ceo.utils.RequestUtils.prepareGetRequest;

import com.google.api.client.http.HttpResponseException;
import java.io.IOException;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.openforis.ceo.db_api.Imagery;
import spark.Request;
import spark.Response;

public class Proxy {

    private static Integer getQParamNoNull(Request req, String name) {
        var param = req.queryParamOrDefault(name, "");
        return param == null || param.equals("null") ? 0 : Integer.parseInt(param);
    }

    private static String buildUrl(Request req, Imagery imagery) {
        var x = req.queryParamOrDefault("x", "");
        var y = req.queryParamOrDefault("y", "");
        var z = req.queryParamOrDefault("z", "");

        var sourceConfig = imagery.getImagerySourceConfig(getQParamNoNull(req, "imageryId"));
        var source = sourceConfig.get("type").getAsString();

        if (List.of("EarthWatch", "DigitalGlobe").contains(source)) {
            var connectId = sourceConfig.get("connectId").getAsString();
            var baseUrl = "https://earthwatch.digitalglobe.com/earthservice/tmsaccess/tms/1.0.0/DigitalGlobe:ImageryTileService@EPSG:3857@jpg/{z}/{x}/{y}.jpg?connectId=";
            return baseUrl.replace("{z}", z).replace("{x}", x).replace("{y}", y) + connectId;
        } else if (source.equals("Planet")){
            var apiKey = sourceConfig.get("accessToken").getAsString();
            var year   = sourceConfig.get("year").getAsString();
            var month  = sourceConfig.get("month").getAsString();
            var tile   = req.queryParamOrDefault("tile", "");

            var baseUrl = "https://tiles" + tile
                            + ".planet.com/basemaps/v1/planet-tiles/global_monthly_"
                            + year + "_" + month
                            + "_mosaic/gmap/{z}/{x}/{y}.png?api_key=";
            return baseUrl.replace("{z}", z).replace("{x}", x).replace("{y}", y) + apiKey;
        } else {
            return "";
        }
    }

    public static HttpServletResponse proxyImagery(Request req, Response res, Imagery imagery) {
        try {
            var url = buildUrl(req, imagery);
            var request = prepareGetRequest(url);
            var response = request.execute();
            res.type("image/jpeg");
            res.status(response.getStatusCode());
            if (res.status() == 200){
                HttpServletResponse raw = res.raw();
                raw.getOutputStream().write(response.getContent().readAllBytes());
                raw.getOutputStream().flush();
                raw.getOutputStream().close();
                return raw;
            } else {
                res.body(response.getContent().toString());
                return res.raw();
            }
        } catch (HttpResponseException e) {
            res.body(e.getStatusMessage());
            res.status(e.getStatusCode());
            return res.raw();
        } catch (IOException e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("Failed to write respose to output stream", e);
        }
    }
}