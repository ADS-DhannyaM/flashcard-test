import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { decksTable, cardsTable } from "./db/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  // Example: create a deck (use a placeholder Clerk userId for the script)
  const deck = await db
    .insert(decksTable)
    .values({
      userId: "user_example_clerk_id",
      name: "Indonesian vocabulary",
      description: "Basic words",
    })
    .returning()
    .then((rows) => rows[0]);

  if (!deck) throw new Error("Failed to create deck");
  console.log("Deck created:", deck.name);

  // Add cards to the deck
  await db.insert(cardsTable).values([
    { deckId: deck.id, front: "Dog", back: "Anjing" },
    { deckId: deck.id, front: "Cat", back: "Kucing" },
  ]);
  console.log("Cards added");

  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deck.id));
  console.log("Cards in deck:", cards);

  // Cleanup: delete deck (cards cascade)
  await db.delete(decksTable).where(eq(decksTable.id, deck.id));
  console.log("Deck and cards deleted");
}

main();
