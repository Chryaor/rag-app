# AI Rate My Professor
### I have used OpenRouter. Change it to OpenAI API. Embeddings only work with openAI. Hugging face is a good alternative.
## Installing dependencies
- Install miniconda or a virtual environment of your choice
- run `conda activate name_of_your_env`
- use `pip install -r requirements.txt`, this will add all the dependencies needed in your virtual env
- used miniconda to create virtual env. Add it to your path variables if using a windows machine.
- use `npm install` to install dependencies

## Description
- Use embeddings to give rating of teachers and which teacher to meet based on a subject or similar.
- Used Pinecone to store the vector db.
- Python to create embeddings using openai.

## Important
I updated the code with gemini API and its working fine. Make the vector dimentsions as 768 and models  
```
result = genai.embed_content(
        model="models/text-embedding-004",
        content=review['review'],
        task_type="retrieval_document",
        title="Embedding of single string")
    embeddings = result['embedding']
```
## Comments
![1000067711](https://github.com/user-attachments/assets/97e18c06-85c2-4594-b78c-4bf9c278b92d)
