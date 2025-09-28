import PhotoBooth from '../PhotoBooth';

export default function PhotoBoothExample() {
  return (
    <PhotoBooth 
      onComplete={() => console.log('Photo booth completed')}
      onCancel={() => console.log('Photo booth cancelled')}
    />
  );
}