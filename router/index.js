module.exports.routes =  (app, apiAuth) => {
    const ACTIVE_VERSION = process.env.ACTIVE_VERSION || v1;

    const roleCtrl = require(__dirname + `../../services/${ACTIVE_VERSION}/role`);

    app.route(`/api/${ACTIVE_VERSION}/role`)
        .post(roleCtrl.postRole)

    app.route(`/api/${ACTIVE_VERSION}/roles`)
        .get(roleCtrl.getRoles)

    app.route(`/api/${ACTIVE_VERSION}/role/:roleID`)
        .get(roleCtrl.getRole)
        // .put(signUp)
        // .delete(signUp)

    // app.route(`/`)
    //     .get(verifyToken, (req, res, next) => {
    //
    //         console.log(req.payload);
    //         res.send({message: `welcome buddy, you are home`});
    //     });
}
