const db = {
  users: [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      quota: 25
    }
  ],
  conges: [],
  nextUserId: 2,
  nextCongeId: 1
};

export function findUser(username, password) {
  return db.users.find(u => 
    u.username === username && 
    u.password === password
  );
}

export function createUser(username, password, role = 'user') {
  const newUser = {
    id: db.nextUserId++,
    username,
    password,
    role,
    quota: 25
  };
  db.users.push(newUser);
  return newUser;
}

export function getUsers() {
  return db.users.map(user => ({
    ...user,
    password: undefined
  }));
}

export function updateUserQuota(userId, newQuota) {
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.quota = newQuota;
  }
  return user;
}

export function getConges(userId) {
  if (userId === 'admin') {
    return db.conges.map(conge => ({
      ...conge,
      username: db.users.find(u => u.id === conge.user_id)?.username || 'Inconnu'
    }));
  }
  return db.conges.filter(c => c.user_id === userId);
}

export function createConge(conge) {
  const newConge = {
    id: db.nextCongeId++,
    user_id: conge.user_id,
    start_date: conge.start_date,
    end_date: conge.end_date,
    motif: conge.motif,
    status: 'pending',
    requested_at: new Date().toISOString(),
    approved_at: null
  };
  db.conges.push(newConge);
  return newConge;
}

export function updateCongeStatus(id, status) {
  const conge = db.conges.find(c => c.id === id);
  if (conge) {
    conge.status = status;
    conge.approved_at = status !== 'pending' ? new Date().toISOString() : null;
  }
  return conge;
}

export function getUserQuota(userId) {
  const user = db.users.find(u => u.id === userId);
  return user ? user.quota : 0;
}

export default {
  findUser,
  createUser,
  getUsers,
  updateUserQuota,
  getConges,
  createConge,
  updateCongeStatus,
  getUserQuota
};
