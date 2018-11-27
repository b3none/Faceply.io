(function () {
  const LoginCtrl = function (
    $window,
    Loading,
    $timeout,
    $rootScope,
    Facebook,
    Storage,
    User,
    Analytics,
    $mdDialog
  ) {
    const c = this

    c.email = null
    c.password = null
    c.error = null

    c.login = function () {
      if (!c.email) {
        c.error = 'Please Enter your Email Address or Phone Number'
        return
      }

      if (!c.password) {
        c.error = 'Please Enter your Password'
        return
      }

      Loading.show('Logging in...')

      Facebook.login(c.email, c.password).then(() => {
        Storage.set({
          email: c.email
        }, 'credentials')
        c.password = null

        Storage.set({
          confirmed: true
        }, 'confirmed_beta')

        Loading.hide()
        $rootScope.loggedIn = true
        $rootScope.$emit('loggedIn')
      }, err => {
        Loading.hide()
        console.error(err)

        if (err.error === 'login-approval') {
          c.error = 'It looks like Facebook have temporarily disabled your account. Please login to <a href="https://facebook.com" target="_blank">Facebook</a>.'
        } else if (err.error === 'Wrong username/password.') {
          c.error = err.error
        } else {
          c.error = 'Couldn\'t login. Please make sure 2 Factor Authentication is not enabled, it\'s not supported.'
        }
      })
    }

    Analytics.pageView('/login')

    Storage.get('credentials')
      .then(credentials => {
        if (credentials && credentials.email) {
          c.email = credentials.email
        }
      })

    Storage.get('confirmed_beta')
      .then(response => {
        if (response && response.confirmed) {
          return
        }

        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Faceply is in Beta!')
            .textContent(`Some bugs and errors are probable.
              We will fix many issues in the following updates.
              We appreciate your patience :)`)
            .ok('Got it!')
        )
      })
  }

  window.angular.module('Faceply')
    .controller('LoginCtrl', [
      '$window',
      'Loading',
      '$timeout',
      '$rootScope',
      'Facebook',
      'Storage',
      'User',
      'Analytics',
      '$mdDialog',
      LoginCtrl
    ])
})()
