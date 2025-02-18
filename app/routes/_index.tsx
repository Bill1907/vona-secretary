import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Recorder from "~/components/recorder";

export const meta: MetaFunction = () => {
  return [
    { title: "Vona secretary" },
    { name: "description", content: "Welcome to Vona secretary" },
  ];
};

interface LoaderData {
  message: string;
}

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({ message: "Hello from Remix API" });
};

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const [transcript, setTranscript] = useState("");

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <div>{data.message}</div>
        <div className="flex flex-col gap-4">
          <Recorder onTranscript={setTranscript} />
          {transcript && (
            <div className="mt-4 p-4 border rounded">
              <h3 className="font-bold mb-2">Transcript:</h3>
              <p>{transcript}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <div>Error</div>;
}
