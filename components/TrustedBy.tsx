import TestimonialsStrip from "./TestimonialsStrip";

interface Props {
  showTestimonials?: boolean;
}

const TrustedBy = ({ showTestimonials = true }: Props) => {
  return (
    <section className="py-8 md:py-14 bg-base-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Trusted by{" "}
              <span className="underline decoration-primary">
                Industry Leaders
              </span>
            </h2>
            <p className="text-base sm:text-lg max-w-7xl mx-auto leading-relaxed">
              Join hundreds of trade professionals who use HTS Hero to make
              tariffs & classification a breeze
            </p>
          </div>
          {/* Testimonials Strip with Companies */}
          <TestimonialsStrip
            showCompanies={true}
            showTestimonials={showTestimonials}
          />
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
