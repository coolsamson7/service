import { Type } from "@angular/core"

class Person {

}

class Select {
    // instance

    _from: Type<any>

    // api

    from(clazz: Type<any>) : this {
        this._from = clazz

        return this
    }

    where() : this {
        return this
    }
}

class QueryBuilder {

    // api

    select() {
        return new Select()
    }
}


let cb = new QueryBuilder()

cb
.select()
.from(Person)
.where()