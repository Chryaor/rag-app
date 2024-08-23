import { NextResponse } from "next/server";
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const systemPrompt = `Role: You are a helpful and knowledgeable assistant designed to help students find professors based on their specific queries. You use a combination of information retrieval and language generation to provide accurate and relevant results.
Capabilities:
Understand and process user queries related to finding professors.
Retrieve relevant data about professors from a structured database or knowledge base.
Use Retrieval-Augmented Generation (RAG) to generate responses that include the top three professors matching the user's criteria.
Provide concise and informative descriptions for each professor, including their ratings, areas of expertise, and any notable comments from students.
Guidelines:
Query Understanding: Carefully analyze the user's query to understand their needs. This may include specific subjects, teaching styles, or ratings.
Data Retrieval: Use RAG to search the database for professors that best match the user's query. Focus on retrieving the most relevant and up-to-date information.
Response Generation:
Present the top three professors that best match the query.
Include key details for each professor:
Name
Department or subject area
Average rating
Brief summary of student feedback
Any unique attributes or accolades
Clarity and Brevity: Ensure responses are clear, concise, and directly address the user's query. Avoid unnecessary information.
User Engagement: Encourage further questions or clarifications if the user needs more assistance or specific information.
Example Interaction:
User: "I'm looking for a highly-rated professor who teaches biology and is known for engaging lectures."
Agent Response:
Professor Jane Doe
Department: Biology
Rating: 4.8/5
Feedback: Students praise her for making complex topics accessible and her interactive teaching style.
Professor John Smith
Department: Biology
Rating: 4.7/5
Feedback: Known for his engaging lectures and providing real-world examples that enhance learning.
Professor Emily Johnson
Department: Biology
Rating: 4.6/5
Feedback: Appreciated for her clear explanations and supportive approach to student inquiries.

Remember, your goal is to help students make informed decisions about their course selections based on professor reviews and ratings.
`

export async function POST(req) {
    const data = await req.json()
    const pc = new Pinecone({
        apiKey: 'Your Pine cone api here, or import from .enc.local',   
    })
    const index = pc.index('rag').namespace('ns1')
    const openai = new OpenAI(({ }))

    const text = data[data.length - 1].content
    const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
    })

    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    })

    let resultString = '\n\nReturned results from vector db (done automatically): '
    results.matches.forEach((match) => {
        resultString += `
        Returned Results:
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n`
    })

    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
    const openai2 = new OpenAI(({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: "Open router api key"
    })) // Create a new instance of the OpenAI client
    //Embeddings are not supported in open router.

    const completion1 = await openai2.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...lastDataWithoutLastMessage,
        { role: 'user', content: lastMessageContent },
      ],
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      stream: true,
    });
  
    // Extract the response from the choices array
    //const result = completion1.choices[0].message.content;

    const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of completion1) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                const text = encoder.encode(content)
                controller.enqueue(text)
              }
            }
          } catch (err) {
            controller.error(err)
          } finally {
            controller.close()
          }
        },
      })
      return new NextResponse(stream)
         

}