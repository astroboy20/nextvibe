interface Props {
  address: string;
}
export const DisplayMap = ({ address }: Props) => {
  const encodedAddress = encodeURIComponent(address);
  return (
    <iframe
      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY}&q=${encodedAddress}`}
      width={"100%"}
      height={"100%"}
      style={{ border: 0 }}
      loading="lazy"
    />
  );
};
