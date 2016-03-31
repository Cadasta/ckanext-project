angular.module('app.config', [])

.constant('USER_ROLES', ['public', 'surveyor', 'editor', 'admin'])
.constant('TABS_USER_ROLES', ['public', 'surveyor', 'editor', 'admin'])
.constant('PROJECT_CRUD_ROLES', ['editor', 'admin', 'sysadmin'])
.constant('PROJECT_ADMIN_ROLES', ['admin', 'sysadmin'])
.constant('PROJECT_RESOURCE_ROLES', ['surveyor', 'editor', 'admin', 'sysadmin'])
.constant('sortByParcel', [{label: 'None', type: 'all'}, {label: 'Parcel ID', type: 'id'}, {label: 'Number of Active Relationships', type: 'num_relationships'}, {label: 'Date Created', type: 'time_created'}])
.constant('sortByRelationship', [{label: 'None', type: 'all'}, {label: 'Relationship ID', type: 'id'}, {label: 'Name', type: 'party_name'}, {label: 'Tenure Type', type: 'tenure_type'}, {label: 'Acquired Date', type: 'date_acquired'}])
.constant('sortByParty', [{ label: 'None', type: 'all'}, {label: 'Party ID', type: 'id'}, {label: 'Name', type: 'party_name'}, {label: 'Party Type', type: 'type'}, {label: 'Active Relationships', type: 'num_relationships'}, { label: 'Date Created', type: 'time_created'}])
.constant('tenureTypes', [
        {   "type":"all",
            "label":"All Types"
        },
        {
            "type": "carbon rights",
            "label": "Carbon rights"
        },
        {
            "type": "concessionary rights",
            "label": "Concessionary rights"
        },
        {
            "type": "customary rights",
            "label": "Customary Rights"
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
            "type": "freehold",
            "label": "Freehold"
        },
        {
            "type": "grazing rights",
            "label": "Grazing Rights"
        },
        {
            "type": "hunting/fishing/harvest rights",
            "label": "Hunting/Fishing/Harvest Rights"
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
            "type": "leasehold",
            "label": "Leasehold"
        },
        {
            "type": "long term leasehold",
            "label": "Long term leasehold"
        },
        {
            "type": "mineral rights",
            "label": "Mineral rights"
        },
        {
            "type": "occupancy",
            "label": "Occupancy (no documented rights)"
        },
        {
            "type": "tenancy",
            "label": "Tenancy (documented sub-lease)"
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
            "type": "water rights",
            "label": "Water rights"
        }
    ])
.constant('activityTypes', [
        {
            type: 'all',
            label: 'All Activities'
        },
        {
            type:'field_data',
            label:'Field Data Activity'
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
        }
    ])

.constant('sortByResource',[{
        type: 'name',
        label: 'File Name'
    },
    {
        type: 'time_created',
        label: 'Date'
    }])
.constant('resourceTypes', [
        {
            type: 'all',
            label: 'All Resources'
        },
        {
            type: 'parcel',
            label: 'Parcel Resources'
        },
        {
            type: 'party',
            label: 'Party Resources'
        },
        {
            type: 'project',
            label: 'Project Resources'
        },
        {
            type: 'relationship',
            label: 'Relationship Resources'
        }
    ])
.constant('partyTypes', [
        {
            type: 'all',
            label: 'All Types'
        },
        {
            type: 'individual',
            label: 'Individuals'
        },
        {
            type: 'group',
            label: 'Groups'
        }
    ])
.constant('landuseTypes', [
    {
        type: 'agriculture',
        label: 'Agriculture'
    },
    {
        type: 'commercial',
        label: 'Commercial'
    },
    {
        type: 'community land',
        label: 'Community Land'
    },
    {
        type: 'grazing',
        label: 'Grazing'
    },
    {
        type: 'other',
        label: 'Other'
    },
    {
        type: 'residential',
        label: 'Residential'
    }
])
.constant('acquiredTypes', [
        {
            type: 'contractual',
            label: 'Contractual/ Share crop'
        },
        {
            type: 'customary_arrangement',
            label: 'Customary arrangement'
        },
        {
            type: 'gift',
            label: 'Gift'
        },
        {
            type: 'homestead',
            label: 'Homestead'
        },
        {
            type: 'informal_occupant',
            label: 'Informal Occupant'
        },
        {
            type: 'inheritance',
            label: 'Inheritance'
        },
        {
            type: 'leasehold',
            label: 'Leasehold'
        },
        {
            type: 'purchased_freehold',
            label: 'Purchased Freehold'
        },
        {
            type: 'rental',
            label: 'Rental'
        },
        {
            type: 'other',
            label: 'Other'
        }
    ])
