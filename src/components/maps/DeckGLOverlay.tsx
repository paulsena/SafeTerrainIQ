import { MapboxOverlay } from '@deck.gl/mapbox';
import { useControl } from 'react-map-gl/maplibre';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';

export default function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay({ ...props, interleaved: true }),
  );
  overlay.setProps(props);
  return null;
}
