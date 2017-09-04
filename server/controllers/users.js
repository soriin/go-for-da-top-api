

const getCurrentUserHandler = [
  (req, res) => {
    const {user, token} = res.locals;
    console.log(user, token);
    res.send(user)
  }
]

module.exports = {
  getCurrentUserHandler
}