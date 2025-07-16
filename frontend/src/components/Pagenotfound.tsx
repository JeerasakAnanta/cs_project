import React from 'react';

const Pagenotfound: React.FC = () => {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
      <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <div className="text-3xl font-semibold text-green-950 ">404</div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-green-900 sm:text-5xl">
            ไม่พบหน้าที่คุณหา{' '}
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            "ขออภัย เราไม่พบหน้าที่คุณกำลังมองหา"
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-green-700 px-3.5 py-2.5 text-xl font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              กลับ หน้าหลัก
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Pagenotfound;
