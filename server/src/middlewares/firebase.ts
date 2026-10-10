import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';


export default () => {
    initializeApp({
        credential: credential.cert('src/middlewares/rusl-biom-dev-firebase-adminsdk-e7uf9-b4e77a3615.json'),
        storageBucket: 'gs://rusl-biom-dev.appspot.com'
    });
};