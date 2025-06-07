import Link from "next/link";
import Header from "../../components/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen max-h-screen overflow-hidden">
      <Header />
      <section className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 p-8 bg-base-100">
        {/* <h3 className="w-full text-xl md:text-2xl font-extrabold tracking-tight text-white ">
          Welcome to HTS Hero!
        </h3> */}

        <div className="w-full space-y-12">
          <h2 className="w-full text-3xl md:text-4xl font-extrabold text-white">
            Welcome! Which sounds more like you?
          </h2>
          <div className="w-full flex flex-col gap-6">
            <Link
              href="/about/importer"
              className="grow btn btn-primary h-60 text-3xl"
            >
              Importer looking for the right HTS Code
            </Link>

            <Link
              href="/about/classifier"
              className="grow btn btn-secondary h-60 text-3xl"
            >
              Classifier looking to speed up my workflow
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
