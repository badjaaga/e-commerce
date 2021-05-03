const layout = require('../layout')

module.exports = ({req}) => {
    return layout({
        content: `
    <div>
      Your id is: ${req.session.userId}
      <form method="POST">
        <input type="email" name="email" placeholder="email" />
        <input type="password" name="password" placeholder="password" />
        <input type="password" name="passwordConfirmation" placeholder="password confirmation" />
        <button>Sign Up</button>
      </form>
    </div>
    `
    });
};