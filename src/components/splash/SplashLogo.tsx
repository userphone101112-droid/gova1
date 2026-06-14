import Image from 'next/image';

export default function SplashLogo() {
  return (
    <div className="flex flex-col items-center gap-6 z-10 py-4">
      <Image
        src="/images/logo.png"
        alt="GoVa Logo"
        width={120}
        height={120}
        priority
      />
      <h1 className="text-3xl font-bold text-white text-center">
        السويس بين يديك
      </h1>
    </div>
  );
}
