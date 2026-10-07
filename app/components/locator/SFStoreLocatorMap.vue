<template>
  <div ref="googleMapContainer" class="size-full"></div>
</template>

<script setup lang="ts">
import {
  shallowRef,
  getCurrentInstance,
  onBeforeUnmount,
  watch,
  onMounted,
  ref,
  render,
  h,
  type ShallowRef,
} from 'vue'
import type { StoreLocation } from '@scayle/omnichannel-nuxt'
import SFStoreDetailsComponent from './SFStoreDetails.vue'
import { useScriptGoogleMaps } from '#imports'
import { useHead } from '#app/composables/head'

const appContext = getCurrentInstance()?.appContext

const { apiKey, stores } = defineProps<{
  stores: StoreLocation[]
  apiKey: string
}>()

const selectedStoreId = defineModel<number | undefined>('selectedStoreId', {
  type: Number,
  default: undefined,
})

const mapOptions: google.maps.MapOptions = {
  clickableIcons: false,
  streetViewControl: false,
  gestureHandling: 'cooperative',
  mapTypeControl: false,
  zoom: 7,
  minZoom: 7,
  maxZoom: 15,
  mapId: 'DEMO_MAP_ID',
  center: {
    lat: 53.550734392966135,
    lng: 9.993024893651084,
  },
}

const { onLoaded } = useScriptGoogleMaps({
  apiKey,
  libraries: ['core'],
})
let mapApi: typeof google.maps
const map: ShallowRef<google.maps.Map | undefined> = shallowRef()
const googleMapContainer = ref<HTMLElement>()
const infoWindows = new Map<number, google.maps.InfoWindow>()
const markers = new Map<number, google.maps.marker.AdvancedMarkerElement>()

/**
 * Renders SFStoreDetailsComponent into a HTMLDivElement.
 *
 * @param store - A HTMLDivElement containing the store details
 */
const getInfoWindowMarkup = (store: StoreLocation) => {
  const vNode = h(SFStoreDetailsComponent, { store })
  vNode.appContext = appContext ?? null
  const el = document.createElement('div')
  render(vNode, el)
  return el
}

let markerLib: google.maps.MarkerLibrary

const setMarkers = async () => {
  if (!map.value || !mapApi) {
    return
  }

  if (!markerLib) {
    markerLib = (await mapApi.importLibrary(
      'marker',
    )) as google.maps.MarkerLibrary
  }

  const bounds = new mapApi.LatLngBounds()

  stores.forEach((store) => {
    const markerIcon = document.createElement('img')
    markerIcon.src = '/icons/map_marker.svg'

    const marker = new markerLib!.AdvancedMarkerElement({
      map: map.value,
      position: store.geoPoint,
      title: store.name,
      content: markerIcon,
    })

    // infoWindow is a tooltip above the map marker, which shows the name of the store
    const infoWindow = new mapApi.InfoWindow({
      content: getInfoWindowMarkup(store),
    })

    marker.addListener('click', () => {
      if (selectedStoreId.value === store.id) {
        selectedStoreId.value = undefined
      } else {
        selectedStoreId.value = store.id
      }
    })

    infoWindow.addListener('closeclick', () => {
      selectedStoreId.value = undefined
    })

    // Expand bounds so all markers are visible when fitting bounds
    const position = marker.position
    if (position) {
      bounds.extend(position)
    }

    // save infoWindows & markers for later access
    infoWindows.set(store.id, infoWindow)
    markers.set(store.id, marker)
  })
  // Move map viewport to show all markers
  map.value!.fitBounds(bounds, {
    left: 500,
    top: 0,
    right: 300,
    bottom: 0,
  })
}

const selectStoreMarker = (storeId: number | undefined) => {
  // close all info windows
  infoWindows.forEach((infoWindow) => infoWindow.close())

  if (storeId === undefined) {
    return
  }

  const infoWindow = infoWindows.get(storeId)
  const marker = markers.get(storeId)

  if (infoWindow && marker) {
    infoWindow.open({ anchor: marker, map: map.value })
  }
}

const removeMarkers = () => {
  markers.forEach((marker) => (marker.map = null))
  markers.clear()
  infoWindows.forEach((infoWindow) => infoWindow.close())
  infoWindows.clear()
}

onMounted(async () => {
  onLoaded(async (instance) => {
    mapApi = await instance.maps
    map.value = new mapApi.Map(googleMapContainer.value!, mapOptions)

    watch(
      () => stores,
      () => {
        if (stores.length) {
          removeMarkers()
          setMarkers()
        }
      },
      { immediate: true },
    )
    watch(
      () => selectedStoreId.value,
      (storeId) => {
        selectStoreMarker(storeId)
      },
      { immediate: true },
    )
  })
})

onBeforeUnmount(() => {
  removeMarkers()
  map.value?.unbindAll()
  map.value = undefined
  googleMapContainer.value?.firstChild?.remove()
})

// Only prefetch dsn on the initial load.
// This on the client, the header would be updated when the page is loaded.
// At the same time we would start fetching google maps, so there would be no benefit of adding this on the client.
if (import.meta.server) {
  useHead({
    link: [
      {
        rel: 'dns-prefetch',
        href: 'https://maps.googleapis.com',
      },
    ],
  })
}
</script>
