// AddQuestions.jsx
import React, { useCallback } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { FileUploadProgressBar } from "../../../components/ui/FileUploadProgressBar";
import { useTTS } from "../../../hooks/useTTS";
import { Volume2, Square } from "lucide-react";

const AddQuestions = () => {
  const { speak, cancel, speaking, supported } = useTTS();

  const instructionsText = `
    Welcome to the Question Upload assistant.

    Step 1: Download the sample Excel format using the Download Sample Excel button.
    Step 2: Open the file and read the header row carefully. Each column represents a field like question text, options, correct answer, marks, difficulty and tags.
    Step 3: Replace the sample questions with your own data. Do not change the column names or their order unless your admin has told you to.
    Step 4: Make sure to keep the file in .xlsx format and save it.
    Step 5: Come back to this page, click on the upload area below, and select your filled Excel file.
    Step 6: Wait for the upload progress bar to reach 100 percent. Once upload and validation are complete, your questions will be linked to the selected batch inside the system.

    If there is any error, you will see it in the upload status area and can re-upload after correcting the file.
  `;

  const handleSpeak = useCallback(() => {
    if (!supported) return;

    if (speaking) {
      cancel();
    } else {
      speak({ text: instructionsText });
    }
  }, [supported, speaking, speak, cancel, instructionsText]);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <PageHeader
          title="Add Questions to Your Batches"
          subtitle="Easily add questions to your batches using the Excel template and bulk upload."
          align="center"
        />

        {/* Instructions + TTS card */}
        <div className="mt-10 mx-auto">
          <div className="border border-gray-600/40 rounded-xl p-5 bg-slate-50/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">
                  How to upload questions
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Follow these steps to download the sample format, fill it with
                  your questions, and upload it back into Evalvo QBMS.
                </p>
              </div>

              {/* TTS control */}
              <button
                type="button"
                onClick={handleSpeak}
                disabled={!supported}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border ${
                  supported
                    ? "hover:bg-slate-100"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                {speaking ? (
                  <>
                    <Square className="w-3 h-3" />
                    Stop audio
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" />
                    {supported ? "Listen to steps" : "Not supported"}
                  </>
                )}
              </button>
            </div>

            {/* Step list */}
            <ol className="mt-4 space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>
                Click{" "}
                <span className="font-semibold">“Download Sample Excel”</span>{" "}
                to get the latest question template.
              </li>
              <li>
                Open the file and read the header row. Each column represents
                question fields such as text, options, correct answer, marks,
                difficulty, tags, and any batch-specific mapping.
              </li>
              <li>
                Replace the sample rows with your own questions. Keep the column
                names and order exactly the same.
              </li>
              <li>
                Save the file as <span className="font-mono">.xlsx</span>.
              </li>
              <li>
                Scroll down to the uploader, drop the file or click to select
                it, and wait until the progress bar reaches 100%.
              </li>
              <li>
                If any row fails validation, you will see an error and can fix
                the Excel and re-upload.
              </li>
            </ol>

            {/* Download sample button */}
            <div className="mt-4">
              <a
                href="/samples/qbms-question-upload-sample.xlsx"
                download
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-semibold px-4 py-2 hover:bg-blue-700 transition"
              >
                Download Sample Excel
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Ask your admin before changing any column names in the template.
              </p>
            </div>
          </div>
        </div>

        {/* Upload widget */}
        <div className="mt-10 p-8 border border-gray-600/40 rounded-xl">
          <div className="max-w-5xl">
            <FileUploadProgressBar />
          </div>
        </div>

        <div className="mt-5 mx-auto text-center">
          <button className="bg-blue-600 px-3 py-2 rounded-2xl text-xl text-white hover:scale-105">Submit</button>
        </div>
      </div>
    </section>
  );
};

export default AddQuestions;
