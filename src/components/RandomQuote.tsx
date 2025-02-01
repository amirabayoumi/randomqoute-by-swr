import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import useSWR from "swr";

const RandomQuote = () => {
  const url = "https://api.adviceslip.com/advice";
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();

    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  const [randomQuote, setRandomQuote] = useState(data?.slip.advice);
  const [adviceId, setAdviceId] = useState(data?.slip.id);

  const [nextQuote, setNextQuote] = useState("");
  const [nextAdviceId, setNextAdviceId] = useState(0);

  useEffect(() => {
    if (data) {
      setRandomQuote(data.slip.advice);
      setAdviceId(data.slip.id);
    }
    if (!nextQuote && data) {
      preloadNextAdvice();
    }
  }, [data]);

  // Function to fetch and store the next advice
  async function preloadNextAdvice() {
    const newData = await fetcher(url);
    setNextQuote(newData.slip.advice);
    setNextAdviceId(newData.slip.id);
    console.log(newData.slip.id);
  }

  async function getAnotherQuote() {
    mutate({ slip: { advice: nextQuote, id: nextAdviceId } }, false);
    await preloadNextAdvice();
  }

  const toClipboard: () => Promise<void> = async () => {
    try {
      await navigator.clipboard.writeText(randomQuote);
      console.log("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleCopy = () => {
    toClipboard();
    toast.success("Copied to clipboard", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <>
      {" "}
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <section>
        <h1> ADVICE #{adviceId}</h1>
        <p>{randomQuote}</p>
        <i onClick={handleCopy}>▢</i>
        <ToastContainer />
        <div>
          <button onClick={getAnotherQuote}>⁙</button>
        </div>
      </section>
    </>
  );
};
export default RandomQuote;
