import * as Topo from 'topojson'
import * as d3geo from 'd3-geo'

//TODO: dynamically load into the store or just include the npm package
//TODO: are these compatible? does the corresponding state in each file have all the same coords/paths?
import countiesTopoJSON from "../stores/counties-10m.json";
import statesTopoJSON from "../stores/states-10m.json";

const TOPO_COUNTIES_KEY = 'counties'
const TOPO_STATES_KEY = 'states'

export function topoJson(granularity = "county") {
  switch(granularity) {
    case "state": return statesTopoJSON
    case "county": return countiesTopoJSON
    default: throw new TypeError(`topoJson: unknown granularity ${granularity}`)
  }
}

//CRZ: maps stateNumbers as strings
let __stateNeighborsMap
function stateNeighborsMap() {
  if(__stateNeighborsMap) { return __stateNeighborsMap }

  let geometries = topoJson('state').objects.states.geometries
  let neighbors = Topo.neighbors(geometries)
  let indexMap = geometries.map(g => g.id)

  return __stateNeighborsMap = neighbors.reduce((acc, nums, i) => {
    return Object.assign(acc, {[indexMap[i]]: nums.map(num => indexMap[num])})
  }, {})
}

//TODO: support granularity == state
//TODO: should i keep the state topo for county granularity?
//TODO: use Object.keys instead of hardcoding the keys
//CRZ: I would use topojson lib to filter, but it doesn't give me access to metadata i need
//     So do manually, then trigger an arc prune with an empty filter, and manually set bbox
let stateTopologies = []
export function topologyForState(state, granularity = "county", includeStateNeighbors = false) {
  let topo = topoJson(granularity)
  let key = (granularity === 'county') ? TOPO_COUNTIES_KEY : TOPO_STATES_KEY
  let cache = stateTopologies.find(t => t.state === state && t.granularity === granularity && t.includeStateNeighbors === includeStateNeighbors)
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

  //CRZ: There's a bug with react-simple-maps where it doesn't render multiple GeometryCollections,
  //     only the first one. Thus we add the state geographies to the "counties" objects key.
  if(includeStateNeighbors) {
    let neighborNumbers = stateNeighborsMap()[state.censusData.number]

    newTopo.objects.counties.geometries = [].concat(
      topo.objects.states.geometries.filter(g => neighborNumbers.includes(g.id)), 
      newTopo.objects.counties.geometries
    )
  }

  newTopo = Topo.filter(newTopo) //This prunes the arcs
  newTopo.bbox =  Topo.bbox(newTopo)

  stateTopologies.push({state, granularity, topo: newTopo, includeStateNeighbors})
  return newTopo
}

//TODO: possibly, different parallels could make it slightly less distorted?
export function projectionForState(state) {
  let topo = topologyForState(state, 'state')

  let center = [(topo.bbox[0] + topo.bbox[2])/2, (topo.bbox[1] + topo.bbox[3])/2]

  let geoTopo = Topo.feature(topo, topo.objects.states.geometries[0])
  return d3geo.geoConicEqualArea()
    .parallels([topo.bbox[1], topo.bbox[3]]) // sets standard parallels for projection to bracket state
    .rotate([-center[0], 0]) //possibly faster to use canvas rotate?
    .center(center)
    .fitSize([800,600], geoTopo) // this sets .scale() and .translate()
}