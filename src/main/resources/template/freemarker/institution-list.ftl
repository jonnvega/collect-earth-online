<script type="text/javascript" src="js/institution-list.js"></script>

<div id="institution-list" ng-app="institutionList" ng-controller="InstitutionListController as institutionList" ng-init="institutionList.initialize()">
    <h1>Institutions [#]</h1>
    <ul>
        <li ng-repeat="institution in institutionList.institutionList">
            <a href="dashboard?project={{ institution.id }}">{{ institution.name }}</a>
        </li>
    </ul>
</div>
