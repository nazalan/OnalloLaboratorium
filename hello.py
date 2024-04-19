import sys

if __name__ == "__main__":
    # Ellenőrizzük, hogy a helyes számú argumentumot kapta-e a szkript
    if len(sys.argv) != 4:
        print("Hiba: Három számot kell megadni paraméterként!")
        sys.exit(1)

    # Paraméterek kinyerése
    numbers = [int(arg) for arg in sys.argv[1:]]
    
    # Számok kiírása egyesével
    print("A kapott számok:")
    for number in numbers:
        print(number)
    
    # Összegzés és összeg kiírása
    total = sum(numbers)
    print("Az adott számok összege:", total)
