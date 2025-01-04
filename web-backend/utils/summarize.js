exports.summarizeText = async (openai, text) => {
    try {
      const response = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant, that summarizes social media posts for users quick browsing. Your job is to create a summary, which is really just a shorter, precise, non-hallucinating represenatation of the text given. Please keep the first person talk as first psrson, and third person talk as it is, dont interchange for the sake of summary, summmarize it with the given conditions." },
            {
                role: "user", content: `Summarize this text:\n\n${text}`,
            }
        ],
        model: "gpt-3.5-turbo",
      });
        console.log("GOT SUMMARY FROM OPENAI", response.choices[0].message.content); 
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error summarizing text:", error);
      return "Error occurred while summarizing.";
    }
}