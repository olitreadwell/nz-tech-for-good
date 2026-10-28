export interface LeafletLayer {
  addTo(map: LeafletMap): LeafletLayer;
  bindTooltip(text: string): LeafletLayer;
  on(event: string, handler: () => void): LeafletLayer;
}

export interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  flyTo?(center: [number, number], zoom: number): LeafletMap;
  remove(): void;
}

export interface LeafletNamespace {
  map(element: HTMLElement): LeafletMap;
  tileLayer(url: string, options: Record<string, unknown>): LeafletLayer;
  circleMarker(center: [number, number], options: Record<string, unknown>): LeafletLayer;
}
