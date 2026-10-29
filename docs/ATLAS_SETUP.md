# MongoDB Atlas setup for LifeNet

The Atlas organization currently shows **No Projects Yet**. Create the project and deployment before configuring LifeNet. LifeNet's API already reads `MONGO_URI`, connects through Mongoose, uses transactions for multi-record workflows, and exposes `/api/health` to report whether MongoDB is connected.

## Create the Atlas project and database deployment

1. In the Atlas organization, select **New Project**.
2. Name it `LifeNet` (or `LifeNet Development`) and create it.
3. In that project, open **Database** / **Clusters** and choose **Create**.
4. Select the cloud provider, region, and deployment tier that fit your use. Review the price shown in Atlas before creating the deployment; choose a free tier only if Atlas offers it for this account and region. LifeNet needs a replica-set deployment that supports transactions.
5. Wait until Atlas reports the deployment is ready.

MongoDB's current instructions: [Create and Connect to Clusters](https://www.mongodb.com/docs/atlas/create-connect-deployments/).

## Configure access safely

Atlas account users and MongoDB database users are separate. Create a database user for LifeNet with a unique password and only the application database permissions it needs. Store that password privately; do not put it in Git, a screenshot, an issue, or this chat.

Add the development computer's current public IP address under **Security → Network Access**. For deployment, allow only the hosting environment's documented outbound IPs or use a private network. Do not use `0.0.0.0/0` for production.

See MongoDB's [Atlas connection prerequisites](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/) for the database-user and IP-access-list requirements.

## Connect the LifeNet API

1. In the deployment, choose **Connect → Drivers** and select Node.js.
2. Copy the URI. Replace its password placeholder, URL-encoding reserved characters in the password if necessary, and use `lifenet` as the database name. Keep the URI private.
3. In the project root, create the local environment file and open it:

   ```powershell
   Copy-Item server/.env.example server/.env
   notepad server/.env
   ```

4. Set `MONGO_URI` to the Atlas URI. Keep it in `server/.env`; never put it in a `VITE_` variable or commit the file.
5. Start the API and check the health endpoint:

   ```powershell
   npm run dev --prefix server
   ```

   In a second terminal:

   ```powershell
   Invoke-RestMethod http://localhost:5000/api/health
   ```

The response should report that the API and database are ready. If it does not, check that the deployment is active, the database user's password is correct, and the connecting IP is on the Atlas access list. MongoDB's [driver connection guide](https://www.mongodb.com/docs/atlas/driver-connection/) covers copying and using the application URI.

## Production deployment

Set `MONGO_URI` as a private environment variable in the hosting service; do not upload `server/.env`. Add the host's supported outbound IPs or configure private networking in Atlas. Confirm `/api/health` reports ready after deployment. Back up the database and use a separate least-privilege database user for each environment.
