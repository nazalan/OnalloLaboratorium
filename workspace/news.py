import sys
from llama_cpp import Llama

def main(date):
    llm = Llama(
          model_path="C:\\work\\onlab\\workspace\\llama-2-7b-chat.Q5_K_M.gguf",
    )
    output = llm(
            "Name three news headlines from {date} about the HUF-EUR exchange rate.",
            max_tokens=200,
    )
    print(output['choices'][0]['text'])

if __name__ == "__main__":
      date=sys.argv[1] if len(sys.argv) > 1 else '2024-01-01'
      main(date)
