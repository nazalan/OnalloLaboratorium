# from llama_cpp import Llama
# llm = Llama(
#       model_path="C:\work\onlab\workspace\llama-2-7b-chat.Q5_K_M.gguf",
#       # n_gpu_layers=-1, # Uncomment to use GPU acceleration
#       # seed=1337, # Uncomment to set a specific seed
#       # n_ctx=2048, # Uncomment to increase the context window
# )
# output = llm(
#       "Q: Name two seasons A: ", # Prompt
#       max_tokens=32, # Generate up to 32 tokens, set to None to generate up to the end of the context window
#       stop=["Q:", "\n"], # Stop generating just before the model would generate a new question
#       echo=True # Echo the prompt back in the output
# ) # Generate a completion, can also call create_completion
# print(output)

from llama_cpp import Llama
llm = Llama(
      model_path="C:\work\onlab\workspace\llama-2-7b-chat.Q5_K_M.gguf",
      # n_gpu_layers=-1, # Uncomment to use GPU acceleration
      # seed=1337, # Uncomment to set a specific seed
      # n_ctx=2048, # Uncomment to increase the context window
)
output = llm(
      "Name three news headlines from 2010.01.01 about the HUF-EUR exchange rate.", # Prompt
      max_tokens=100, # Generate up to 32 tokens, set to None to generate up to the end of the context window
) # Generate a completion, can also call create_completion
print(output)