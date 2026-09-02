export const INSPIRING_QUOTES = [
  {
    quote: "What we know is a drop, what we don't know is an ocean.",
    author: "Sir Isaac Newton",
    role: "Physicist & Mathematician"
  },
  {
    quote: "The science of today is the technology of tomorrow.",
    author: "Edward Teller",
    role: "Theoretical Physicist"
  },
  {
    quote: "Any sufficiently advanced technology is indistinguishable from magic.",
    author: "Arthur C. Clarke",
    role: "Futurist & Author"
  },
  {
    quote: "Imagination is more important than knowledge. Knowledge is limited. Imagination embraces the world.",
    author: "Albert Einstein",
    role: "Theoretical Physicist"
  },
  {
    quote: "Simplicity is the prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    role: "Pioneer of Computer Science"
  },
  {
    quote: "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
    author: "Alan Turing",
    role: "Father of Modern Computing"
  },
  {
    quote: "Somewhere, something incredible is waiting to be known.",
    author: "Carl Sagan",
    role: "Astronomer & Astrobiologist"
  },
  {
    quote: "Nature uses only the longest threads to weave her patterns, so each small piece reveals the whole tapestry.",
    author: "Richard Feynman",
    role: "Nobel Laureate in Physics"
  },
  {
    quote: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    role: "Philosopher"
  },
  {
    quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie",
    role: "Nobel Laureate in Physics & Chemistry"
  },
  {
    quote: "The function of good software is to make the complex appear simple.",
    author: "Grady Booch",
    role: "Software Engineering Pioneer"
  },
  {
    quote: "Computers are incredibly fast, accurate, and stupid. Humans are slow, inaccurate, and brilliant. Together they are powerful beyond imagination.",
    author: "Albert Einstein",
    role: "Theoretical Physicist"
  },
  {
    quote: "Knowledge is of no value unless you put it into practice.",
    author: "Anton Chekhov",
    role: "Author & Physician"
  },
  {
    quote: "The present is theirs; the future, for which I really worked, is mine.",
    author: "Nikola Tesla",
    role: "Inventor & Electrical Engineer"
  },
  {
    quote: "To know that we know what we know, and to know that we do not know what we do not know, that is true knowledge.",
    author: "Nicolaus Copernicus",
    role: "Astronomer & Polymath"
  }
];

export function getRandomInspiringQuote() {
  const index = Math.floor(Math.random() * INSPIRING_QUOTES.length);
  return INSPIRING_QUOTES[index];
}
