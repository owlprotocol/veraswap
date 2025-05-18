export type Prettify<T> = {
    [K in keyof T]: T[K];
    //Replaced `{}` due to warning
} & NonNullable<unknown>;
