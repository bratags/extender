(async function (shops) {
    const re = {
        amazon: new RegExp(/amazon.com\/gp\/your-account/)
    }

    shops.rePrivacyFilter = (shop) => {
        return re[shop] || new RegExp(/$^/);
    }
  })(
    typeof module !== "undefined" && module.exports
      ? module.exports
      : (self.shops = self.shops || {})
  );
  