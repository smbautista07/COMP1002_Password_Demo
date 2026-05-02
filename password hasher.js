import {createInterface} from "node:readline";

var inp = createInterface(
    {
        input: process.stdin,
        output:process.stdout,
    }
);

inp.question("Input a password \n", (password) =>
{
    console.log(password);
});
