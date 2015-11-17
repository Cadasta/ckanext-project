angular.module('app.config', [])

.constant('USER_ROLES', ['public', 'surveyor', 'editor', 'admin'])
.constant('PROJECT_CRUD_ROLES', ['editor', 'admin', 'sysadmin'])
.constant('PROJECT_RESOURCE_ROLES', ['surveyor', 'editor', 'admin', 'sysadmin'])
.constant('sortByParcel', [{label: 'None', type: 'all'}, {label: 'Parcel ID', type: 'id'}, {label: 'Number of Active Relationships', type: 'num_relationships'}, {label: 'Date Created', type: 'time_created'}])
.constant('sortByRelationship', [{label: 'None', type: 'all'}, {label: 'Relationship ID', type: 'id'}, {label: 'Name', type: 'party_name'}, {label: 'Tenure Type', type: 'tenure_type'}, {label: 'Acquired Date', type: 'date_acquired'}])
.constant('sortByParty', [{ label: 'None', type: 'all'}, {label: 'Party ID', type: 'id'}, {label: 'Name', type: 'party_name'}, {label: 'Party Type', type: 'type'}, {label: 'Active Relationships', type: 'num_relationships'}, { label: 'Date Created', type: 'time_created'}])
.constant('tenureTypes', [
        {   "type":"all",
            "label":"All Types"
        },
        {
            "type": "indigenous land rights",
            "label": "Indigenous Land Rights"
        },
        {
            "type": "joint tenancy",
            "label": "Joint Tenancy"
        },
        {
            "type": "tenancy in common",
            "label": "Tenancy in common"
        },
        {
            "type": "undivided co-ownership",
            "label": "Undivided Co-ownership"
        },
        {
            "type": "easement",
            "label": "Easement"
        },
        {
            "type": "equitable servitude",
            "label": "Equitable servitude"
        },
        {
            "type": "mineral rights",
            "label": "Mineral rights"
        },
        {
            "type": "water rights",
            "label": "Water rights"
        },
        {
            "type": "concessionary rights",
            "label": "Concessionary rights"
        },
        {
            "type": "carbon rights",
            "label": "Carbon rights"
        }
    ])
.constant('activityTypes', [
        {
            type: 'all',
            label: 'All Activities'
        },
        {
            type: 'parcel',
            label: 'Parcel Activity'
        },
        {
            type: 'party',
            label: 'Party Activity'
        },
        {
            type: 'relationship',
            label: 'Relationship Activity'
        },
        {
            type:'field_data',
            label:'Field Data Activity'
        }
    ])