/* eslint-disable */



export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoidmpmdm5pZnZuamZpam4iLCJhIjoiY2tpcnhhbXQ1MDVscTM0cm91ZTl1OW5tciJ9.EAJpF7o7IjD87oQibjAJ9w';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vjfvnifvnjfijn/ckis46r7c0lb819pamh7v2sxq',
    scrollZoom: false
    
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {

    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    new mapboxgl.Popup({
        offset: 30
    })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map)


    //Extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds , {
    padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100   
    }
} );
}

