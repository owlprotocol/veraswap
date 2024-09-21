import { hello } from "./hello.js";

async function main() {
    while (true) {
        console.log(`${Date.now()} ${hello()}`);
    }
}

if (typeof require !== "undefined" && require.main === module) {
    main();
}
