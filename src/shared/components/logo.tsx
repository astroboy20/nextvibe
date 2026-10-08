import Image from "next/image";

export function Logo({
  withText = false,
  isWhite = false,
}: {
  withText?: boolean;
  isWhite?: boolean;
}) {
  if (isWhite && withText) {
    return (
      <Image src="/logos/white-text.png" alt="logo" width={150} height={100} />
    );
  }
  return (
    <div className="flex items-center">
      {withText ? (
        <Image
          src="/logos/new-logo-with-text.png"
          alt="logo"
          width={120}
          height={120}
        />
      ) : (
        <Image src="/logos/logo.png" alt="logo" width={70} height={70} />
      )}
    </div>
  );
}

export function NewLogo({
  variant = "black",
  size = 200,
  h = 60,
}: {
  variant?: "white" | "black";
  size?: number;
  h?: number;
}) {
  return (
    <Image
      src={`/logos/new/logo_${variant}_text.png`}
      alt="Logo"
      width={size}
      height={h}
    />
  );
}
