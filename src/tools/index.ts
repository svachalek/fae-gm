import { StructuredToolInterface } from "@langchain/core/tools";
import rollDice from "./rollDice";

const tools: StructuredToolInterface[] = [rollDice];

export default tools;
