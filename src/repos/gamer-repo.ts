import { IGamer } from '@models/gamer-model';
import orm from './mock-orm';




async function getOne(id: string): Promise<IGamer | null> {
    const db = await orm.openDb();
    for (const user of db.users) {
        if (user.id === id) {
            return user;
        }
    }
    return null;
}


/**
 * See if a user with the given id exists.
 * 
 * @param id 
 */
async function persists(id: number): Promise<boolean> {
    const db = await orm.openDb();
    for (const user of db.users) {
        if (user.id === id) {
            return true;
        }
    }
    return false;
}


/**
 * Get all users.
 * 
 * @returns 
 */
async function getAll(): Promise<IGamer[]> {
    const db = await orm.openDb();
    return db.users;
}


/**
 * Add one user.
 * 
 * @param user 
 * @returns 
 */
async function add(user: IGamer): Promise<void> {
    const db = await orm.openDb();
    db.users.push(user);
    return orm.saveDb(db);
}


/**
 * Update a user.
 * 
 * @param user 
 * @returns 
 */
async function update(user: IGamer): Promise<void> {
    const db = await orm.openDb();
    for (let i = 0; i < db.users.length; i++) {
        if (db.users[i].id === user.id) {
            db.users[i] = user;
            return orm.saveDb(db);
        }
    }
}


/**
 * Delete one user.
 * 
 * @param id 
 * @returns 
 */
async function deleteOne(id: number): Promise<void> {
    const db = await orm.openDb();
    for (let i = 0; i < db.users.length; i++) {
        if (db.users[i].id === id) {
            db.users.splice(i, 1);
            return orm.saveDb(db);
        }
    }
}


// Export default
export default {
    getOne,
    persists,
    getAll,
    add,
    update,
    delete: deleteOne,
} as const;
