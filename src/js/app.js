let map;
let vm;
const Model = {
    //Places of intrests hardcoded into app.js to work on failure from 
    //foursquare api request so users still has some markers show up on map
    locations: [{
        title: 'Forest Park Carasouel',
        location: { lat: 40.7027, lng: -73.8493 },
        content: "Forest Park is a park in the New York City borough of Queens. It has an area of 538 acres, containing 165 acres of trees. The park is operated and maintained by the New York City Department of Parks and Recreation."
    }, {
        title: 'Target',
        location: { lat: 40.7210, lng: -73.8478 },
        content: "Retail chain offering home goods, clothing, electronics & more, plus exclusive designer collections."
    }, {
        title: 'Marthas Bakery',
        location: { lat: 40.7203, lng: -73.8460 },
        content: "Carrot cake, chocolate mousse, gelato, marble yogurt pound cake, very berry napoleon, Oreo cupcake, frozen mixed drinks, hot chocolate, coffee…this is only the beginning of what meets the eyes upon entering the newly expanded Martha’s Country Bakery in Forest Hills."
    }, {
        title: 'The Grill',
        location: { lat: 40.7208, lng: -73.8453 },
        content: 'Contemporary, brick-walled restaurant & bar with Mediterranean fare & weekday happy-hour specials.'
    }, {
        title: 'Pahal Zhan',
        location: { lat: 40.7194, lng: -73.8452 },
        content: "Pahal Zan is a cornerstone in the Forest Hills community and has been recognized for its outstanding Mediterranean cuisine, excellent service and friendly staff."
    }],
    markers: []
}

function AppViewModel(marker) {
    const self = this;
    self.createListings = ko.observableArray();
    //function to associates list title to marker to animate on click
    self.activateMarker = function(currentItem) {
        var marker = currentItem;
        google.maps.event.trigger(marker, 'click');
    };
}


function initMap() {
    const forestHills = { lat: 40.7181, lng: -73.8448 }
    vm = new AppViewModel();
    map = new google.maps.Map(document.getElementById('map'), {
        center: forestHills,
        zoom: 15,
        mapTypeControl: false,
        styles: [{ "featureType": "administrative", "elementType": "all", "stylers": [{ "visibility": "on" }, { "lightness": 33 }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2e5d4" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#c5dac6" }] }, { "featureType": "poi.park", "elementType": "labels", "stylers": [{ "visibility": "on" }, { "lightness": 20 }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#c5c6c6" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#e4d7c6" }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#fbfaf7" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "visibility": "on" }, { "color": "#acbcc9" }] }]
    });
    //need to add foursquare request and hook it up to input box in html 
    function getFourSquare() {
        var client_id = "ZBCPIT5VPYBTT2KNLCWMIJU4BAL4ANCO4MPJHLSJBOYB3D32";
        var client_secret = '2K5DPY4FG2DN2ZX4JSTWXHUN140LMR1JHGE04YCXOU0P303P';
        //userless request url passing in search query from
        //form input
        var fourSquareUrl = "https://api.foursquare.com/v2/venues/search" +
            "?client_id=" + client_id +
            "&client_secret=" + client_secret +
            "&v=20160815" +
            "&ll=" + 40.7181 + "," + -73.8448;
        $.ajax({
            url: fourSquareUrl,
            dataType: 'json',
        }).done(function(data) {
            let foursquareResponse = data.response.venues
            if (Model.markers.length === 0) {
                console.log('nothing in the marker')
                Model.markers.push(foursquareResponse)
            }
            console.log(Model.markers[0].length);
            for (let i = 0; i < Model.markers[0].length; i++) {
                createMarker(Model.markers[0][i].location, Model.markers[0][i].name)
            }
        }).fail(function() {
            for (let i = 0; i < Model.locations.length; i++) {
                createMarker(Model.locations[i].location, Model.locations[i].title, Model.locations[i].content)
            }
        })
    }
    getFourSquare();
    //creates marker function to call whenever I need to create a marker
    //also works in animating marker upon being clicked
    function createMarker(position, title) {
        const streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=300x300&location=';
        let contentStr;
        for (let i = 0; i < Model.markers[0].length; i++) {
            contentStr = '<div><img src="' + streetViewURL + Model.markers[0][i].location.formattedAddress + '">' + '<div class="marker-title">' + Model.markers[0][i].name + '</div>';
        }
        let marker = new google.maps.Marker({
            position: position,
            title: title,
            content: contentStr,
            map: map,
            icon: 'http://maps.google.com/mapfiles/marker_yellow.png',
            animation: google.maps.Animation.DROP
        })
        vm.createListings.push(marker);
        let bounds = new google.maps.LatLngBounds();
        //pushes new created marker into markers array in model
        let infowindow = new google.maps.InfoWindow({});
        //listener to animate marker upon click changes icon color and animation 
        //sets infowindow content when maker is clicked and opens infowindow
        function markerAnimate() {
            marker.addListener('click', function() {
                if (this.getAnimation() !== null) {
                    this.setAnimation(null);
                    this.setIcon('http://maps.google.com/mapfiles/marker_yellow.png');
                    infowindow.close(map, this);
                } else {
                    $(this).addClass('clickable');
                    this.setAnimation(google.maps.Animation.BOUNCE);
                    this.setIcon('http://maps.google.com/mapfiles/marker_purple.png');
                    infowindow.setContent(this.content);
                    infowindow.open(map, this);
                    bounds.extend(this.position)
                }
            });
        }
        //need to work on function that animates marker when lsiting is clicked
        // $('.list-view').on('click', function() {
        //     if ($(this).text() == Model.markers.title) {
        //         console.log($(this).text())
        //     }
        // })
        markerAnimate();
    }

    ko.applyBindings(vm);
}