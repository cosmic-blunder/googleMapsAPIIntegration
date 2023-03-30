/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// In the following example, markers appear when the user clicks on the map.
// The markers are stored in an array.
// The user can then click an option to hide, show or delete the markers.
let map: google.maps.Map;
let markers: google.maps.Marker[] = [];


var init=false;

class DServices {
      dR:google.maps.DirectionsRenderer 
      dS:google.maps.DirectionsService 
      
      constructor(s,r){

        this.dR=r;
        this.dS=s;
      }
}

var glob:DServices;

function initMap(): void {

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({draggable:true});
  const haightAshbury = { lat: 37.769, lng: -122.446 };

  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    zoom: 12,
  
    center: haightAshbury,
    mapTypeId: "terrain",
  });
   //directionsRenderer.setMap(map);


  // This event listener will call addMarker() when the map is clicked.
  map.addListener("click", (event: google.maps.MapMouseEvent) => {
    addMarker(event.latLng!);
  });

  // add event listeners for the buttons
  document
    .getElementById("show-markers")!
    .addEventListener("click", showMarkers);
  document
    .getElementById("hide-markers")!
    .addEventListener("click", hideMarkers);
  document
    .getElementById("delete-markers")!
    .addEventListener("click", MoveCar);

    //initiate direction services
    glob =  new DServices( directionsService,directionsRenderer);
    
    
    // Adds a marker at the center of the map.




}

var marker_ : (google.maps.LatLng|google.maps.LatLngLiteral)[] = [];

var path: google.maps.Polyline[] =[];

var pathCoord:google.maps.LatLng[] = [];

var prev:google.maps.LatLng;

function abs(number:number){
       
     return Math.abs(number);
}


function Same(str,str2){

  return str==str2;
}
var markerCar:google.maps.Marker|undefined;
function MoveCar(){

  if(marker_.length>1)

  markerCar = markers.shift();

  setInterval(()=>{

    if(pathCoord.length>0){

      var path = pathCoord.shift();
    //  console.log( Math.abs(path?.lat()!),"-",Math.abs(path?.lng()!));
      markers.forEach(m=>{
       
       var delta = 0.0001;
       var res = abs(path?.toJSON().lat!)-abs(m.getPosition()?.toJSON().lat!);
       var resLng = abs(path?.toJSON().lng!)-abs(m.getPosition()?.toJSON().lng!);

          if((res<delta)&&(resLng<delta)){
       
               m.setMap(null);
          }
      });

      //UpdatePolyPath(pathCoord);
      console.log(markerCar?.getPosition()?.toJSON());

      console.log("Before update:",pathCoord);
     
      markerCar?.setPosition(path);

      //UpdatePolyPath(pathCoord);
      console.log(markerCar?.getPosition()?.toJSON());
      
      UpdatePath();
     console.log("After update:",pathCoord);
      
    }
           
  },1000);
     
}
// Adds a marker to the map and push to the array.
function addMarker(position: google.maps.LatLng | google.maps.LatLngLiteral) {
  
  var obj;
  if(markers.length==0){

    obj={
      position,
      map,
      icon:"https://i.ibb.co/r6mhcL3/imgonline-com-ua-resize-d9c-MN4zw-EHz-X.png"
    };
    
  }else{

    obj= {
      position,
      map
  };
   
  }

  const marker = new google.maps.Marker(obj);

  markers.push(marker);
  marker_.push(position);

  if(marker_.length>1){


    glob.dS.route({
      origin: marker_[0],
      destination:marker_[marker_.length-1] ,
      waypoints: marker_.slice(1, marker_.length-1).map<google.maps.DirectionsWaypoint>((pos)=>({ location: pos })),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      console.log(response);
      if(path.length==0){

        path.push(GenPath(response));
        path[0].setMap(map);
      }else{
          
         path[0].setMap(null);
         path.pop();

         path.push(GenPath(response));
         path[0].setMap(map);
      }

      //glob.dR.setDirections(response);
    });
    
  }


}
function GenPath(response:google.maps.DirectionsResult){

  const path = new google.maps.Polyline({
    path: response.routes[0].overview_path,
    geodesic: true,
    strokeColor: "#0000e6",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  });

  pathCoord=response.routes[0].overview_path;
  pathCoord.shift();
  return path;

}

function UpdatePolyPath(newPth: google.maps.LatLng[]){

  path[0].setMap(null);
  path.pop();

  const npath = new google.maps.Polyline({
    path: newPth,
    geodesic: true,
    strokeColor: "#0000e6",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  });


  path.push(npath);
  npath.setMap(map);
 

}

function UpdatePath(){


  glob.dS.route({
    origin:markerCar?.getPosition()!,
    destination:marker_[marker_.length-1] ,
    waypoints: marker_.slice(1, marker_.length-1).map<google.maps.DirectionsWaypoint>((pos)=>({ location: pos })),
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING,
  })
  .then((response) => {
    console.log(response);
    if(path.length==0){

      path.push(GenPath(response));
      path[0].setMap(map);
    }else{
        
       path[0].setMap(null);
       path.pop();

       path.push(GenPath(response));
       path[0].setMap(map);
    }

    //glob.dR.setDirections(response);
  });
}
// Sets the map on all markers in the array.
function setMapOnAll(map: google.maps.Map | null) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers(): void {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers(): void {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers(): void {
  hideMarkers();
  markers = [];
}

declare global {
  interface Window {
    initMap: () => void;
  }
}

function  GetLiveLocation(){
  navigator.geolocation.getCurrentPosition((position)=>{
            console.log(position);

  })

}
setTimeout(()=>Ge(),1000);
window.initMap = initMap;
export {};
