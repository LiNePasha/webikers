declare module 'dom-to-image-more' {
  export interface DomToImageOptions {
    filter?: (node: Node) => boolean
    bgcolor?: string
    width?: number
    height?: number
    style?: Record<string, string>
    quality?: number
    cacheBust?: boolean
    imagePlaceholder?: string
  }

  const domtoimage: {
    toPng(node: Node, options?: DomToImageOptions): Promise<string>
    toJpeg(node: Node, options?: DomToImageOptions): Promise<string>
    toBlob(node: Node, options?: DomToImageOptions): Promise<Blob>
    toSvg(node: Node, options?: DomToImageOptions): Promise<string>
    toPixelData(node: Node, options?: DomToImageOptions): Promise<Uint8Array>
  }

  export default domtoimage
}
