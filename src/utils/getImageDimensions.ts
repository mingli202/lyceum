export default async function getImageDimensions(url: string): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((res) => {
    const image = new Image();

    image.onload = () => res({ height: image.height, width: image.width });

    image.src = url;
  });
}
