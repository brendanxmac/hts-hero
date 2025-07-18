import { FeatureI } from "../interfaces/ui";
import { Guide, GuideName } from "../types/guides";

const stepOne = (
  <div className="flex flex-col gap-2">
    <p>
      Enter your product description in the text box and{" "}
      <span className="font-bold">then hit next</span>.
    </p>
    <p>We immdeiately start finding the best candidates for you.</p>
    <p>
      Important: Be sure to follow the good description tips (⚡️) to get the
      best possible results.
    </p>
  </div>
);

const stepTwo = (
  <div className="flex flex-col gap-2">
    <p>
      After finding the most likely candidates for your product, we suggest the
      one we think is the best fit.
    </p>
    <p>You click the best option you see and hit next.</p>
    <p>
      We then move to the next level (if needed), and repeat the process until
      we have the official 10 digit code.
    </p>
    <p>
      The first level is usually 4 digits, the next is 6, and so on until 10.
    </p>
  </div>
);

const stepThree = (
  <div className="flex flex-col gap-2">
    <p>Once we've gotten to a full 10 digit HTS Code, you're all set!</p>
    <p>
      Click the download button to save your classification and to show customs
      if needed.
    </p>
  </div>
);

export const classifyGuideSteps: FeatureI[] = [
  {
    title: "Navigation",
    description: (
      <div className="flex flex-col gap-2">
        <p>
          <span className="font-bold text-primary">Summary</span> shows you the
          different steps for finding your code and allows you to jump between
          them.
        </p>
        <p>
          <span className="font-bold text-secondary">Current step</span> is the
          where you enter product descriptions and select from the best-fitting
          options.
        </p>
      </div>
    ),
    mediaType: "image",
    mediaPath: "/two-sections.png",
    mediaFormat: "image/png",
    altText: "Classify Sections",
  },
  {
    title: "Step 1: Enter your Product Description",
    description: stepOne,
    mediaType: "image",
    mediaPath: "/start-by.png",
    mediaFormat: "image/png",
  },
  {
    title: "Step 1: Enter your Product Description",
    description: stepOne,
    mediaType: "video",
    mediaPath: "/start-classification.mp4",
    mediaFormat: "video/mp4",
    altText: "Start Classification",
  },
  {
    title: "Step 2: Verify our Suggestions",
    description: stepTwo,
    mediaType: "image",
    mediaPath: "/select-the-best.png",
    mediaFormat: "image/png",
    altText: "Verify our Suggestion",
  },
  {
    title: "Step 2: Verify our Suggestions",
    description: stepTwo,
    mediaType: "video",
    mediaPath: "/select-best-candidate.mp4",
    mediaFormat: "video/mp4",
    altText: "Verify our Suggestion",
  },
  {
    title: "Step 3: Get your Code!",
    description: stepThree,
    mediaType: "video",
    mediaPath: "/download-report.mp4",
    mediaFormat: "video/mp4",
    altText: "Save your Code!",
  },
  {
    title: "Pro Tip: Adjusting Descriptions Really Helps",
    description: (
      <div className="flex flex-col gap-2">
        <p>
          If no options seem like a good fit, try changing your product
          description. See the ⚡️ for tips on how to get the best results.
        </p>
        <p>
          After making any edits, just hit next and we'll find the best matches
          for your new description.
        </p>
      </div>
    ),
    mediaType: "video",
    mediaPath: "/tweak-description.mp4",
    mediaFormat: "video/mp4",
    altText: "Tweak Description",
  },
  {
    title: "Pro Tip: Full Search is a Click Away",
    description: (
      <div className="flex flex-col gap-2">
        <p>
          Another way to quickly find other results is to jump over to our
          explorer to search for a suitable match by navigating the sections or
          typing in the search bar.
        </p>
        <p>
          Pro Tip: You can use elements or partial codes from the explorer as
          inspiration to guide your product description back in classify. This
          will quickly get you a full code or downloadable report with reasons
          for each selection.
        </p>
      </div>
    ),
    mediaType: "video",
    mediaPath: "/jump-to-explore.mp4",
    mediaFormat: "video/mp4",
    altText: "Jump to Explore",
  },
];

export const guides: Guide[] = [
  {
    name: GuideName.CLASSIFY,
    steps: classifyGuideSteps,
    routes: ["/app"],
    daysUntilShowAgain: 3,
  },
];
