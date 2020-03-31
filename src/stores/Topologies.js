import * as Topo from 'topojson'
import * as d3geo from 'd3-geo'
//TODO: dynamically load into the store or just include the npm package
import countiesTopoJSON from "../stores/counties-10m.json";
import statesTopoJSON from "../stores/states-10m.json";
// const countiesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
// const statesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function topoJson(granularity) {
  switch(granularity) {
    case "state": return [statesTopoJSON, "states"];
    case "county": return [countiesTopoJSON, "counties"];
    default: throw new TypeError(`topologyForState: unknown granularity ${granularity}`)
  }
}


//TODO: support granularity == state
//TODO: should i keep the state topo?
//TODO: use Object.keys instead of hardcoding the keys
//CRZ: I would use topojson lib to filter, but it doesn't give me access to metadata i need
//     So do manually, then trigger an arc prune with an empty filter, and manually set bbox
let stateTopologies = []
export function topologyForState(state, granularity = "county") {
  let [topo, key] = topoJson(granularity)
  let cache = stateTopologies.find(t => t.state === state && t.granularity === granularity)
  if(cache) { return cache.topo }

  //filter out objects that arent part of our state.
  let stateNumber = state.censusData.number
  let geometries = topo.objects[key].geometries.filter((g) => {
    //CRZ: this works because for states the id is the state number,
    //     and for counties the id is the FIPS, and the first two numbers of FIPS
    //     is the state number
    return g.id.slice(0,2) === stateNumber
  })
  let newTopo = {
    arcs: topo.arcs,
    bbox: topo.bbox,
    objects: {
      [key]: {
        type: 'GeometryCollection',
        geometries: geometries
      }
    },
    type: topo.type,
    transform: topo.transform
  }
  
  newTopo = Topo.filter(newTopo) //This prunes the arcs
  newTopo.bbox =  Topo.bbox(newTopo)

  stateTopologies.push({state: state, granularity: granularity, topo: newTopo})
  return newTopo
}

export function topologyForUSA(granularity = "county") {
  }

//TODO: possibly, different parallels could make it slightly less distorted?
export function projectionForState(state) {
  let topo = topologyForState(state, 'state')

  let center = [(topo.bbox[0] + topo.bbox[2])/2, (topo.bbox[1] + topo.bbox[3])/2]
  debugger

  let geoTopo = Topo.feature(topo, topo.objects.states.geometries[0])
  return d3geo.geoConicEqualArea()
    .parallels([topo.bbox[1], topo.bbox[3]]) // sets standard parallels for projection to bracket state
    .rotate([-center[0], 0]) //possibly faster to use canvas rotate?
    .center(center)
    .fitSize([800,600], geoTopo) // this sets .scale() and .translate()
}