import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { HomeComponent } from '../home/home.component';

import { LoggerService } from "../../common/log/logger.service";
import { TransactionService } from "./transaction.service";

@Component({
  selector: 'page-home',
  templateUrl: 'transaction.component.html'
})
export class TransactionComponent {


  /**
   * @description Data received from parent
   * @private 
   */
  private parentData: any = null;

  /**
   * @description Title of component
   * @public 
   */
  public title: string = 'Transaction Details';

  /**
   * @description Transaction object
   * @public 
   */
  public transaction: any;

  /**
   * @description list of categories
   * @public 
   */
  public categories: any[];

  /**
   * @description list of accountabilities
   * @public 
   */
  public accountabilities: any[];

  /**
   * @description Selected Category Index
   * @public 
   */
  public selectedCategoryIndex: number = 0;

  /**
   * @description Selected Accountability Index
   * @public 
   */
  public selectedAccountabilityIndex: number = 0;

  /**
   * @constructor 
   * @param navCtrl Navigation Controller
   * @param navParams It is used to retrieve navigation parameters
   * @param storage Storage Service provided by Ionic
   * @param logger Logger Service
   */

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private logger: LoggerService,
    private transactionService: TransactionService) {

    var context = this;

    context.parentData = navParams.get('parentData');
    storage.ready().then(() => {
      context.loadData();
    });
  }

  /**
   * @description Function to load data related to this component
   */
  loadData() {

    var context = this;

    if(!context.parentData ||
      !context.parentData.title ||
      !context.parentData.CATEGORIES_KEY ||
      !context.parentData.SEPARATOR) {
        context.logger.error('TransactionComponent --> Error in retrieving parent data');
        return;
    }

    context.storage.get(context.parentData.CATEGORIES_KEY).then((storeData) => {
      if (storeData === null || typeof storeData === 'undefined') {  //  True: when no value is stored in storage
        context.logger.error('TransactionComponent --> Error in retrieving storage data');
        return;
      } else {
        context.categories = JSON.parse(storeData);
      }


      if (context.parentData.isPristine === true) {                 // Add new transaction
        context.transaction = context.getBean();
        context.transaction.category = context.categories[context.selectedCategoryIndex];  // Set first category as default
      } else {                                 // update/delete existing transaction
        context.transaction = JSON.parse(JSON.stringify(context.parentData.transaction));
        context.selectedCategoryIndex = context.categories.findIndex((obj => obj.id == context.parentData.transaction.category.id));
        context.transaction.category = context.categories[context.selectedCategoryIndex];
      }
      context.loadAccountabilities();
      context.title = context.parentData.title;
    });

  }

   /**
   * @description Function to load accountabilities related to selected category
   */
  loadAccountabilities() {
    let context = this,
        storeURL = context.parentData.CATEGORIES_KEY + 
                     context.parentData.SEPARATOR + 
                     context.transaction.category.id;

    context.storage.get(storeURL).then((accountabilityData) => {

        accountabilityData = JSON.parse(accountabilityData);
        context.accountabilities = accountabilityData.accountabilities;
        if(context.parentData.isPristine !== true) {
          context.selectedAccountabilityIndex = context.accountabilities.findIndex((obj => obj.id == context.parentData.transaction.accountability.id));
        }
        context.transaction.accountability = context.accountabilities[context.selectedAccountabilityIndex];
        context.logger.log('test');
    });
 
  }

  /**
   * @description Function to save the Transaction
   */
  save() {
    var context = this;
    context.transaction.price = parseInt(context.transaction.price);

    if (context.parentData.isPristine || true) {
        let storeURL = context.parentData.CATEGORIES_KEY +
                     context.parentData.SEPARATOR +
                     this.transaction.category.id;

      context.storage.get(storeURL).then((store) => {

        store = JSON.parse(store);

        if (store === null || typeof store === 'undefined' ||   //  True: when account does not exist in store 
                            typeof store.accountabilities === 'undefined') {  //  True: when no value is stored in storage
          context.logger.error('FATAL ERROR: Error in retriving Accountability List.');
          return;
        } else {

        if(context.parentData.isPristine !== true) {  //  For update/delete tranasction --> Delete selected transaction first
          let previousAccountabilityIndex = store.accountabilities.findIndex((obj => obj.id == context.parentData.transaction.accountability.id));
          let previousCategoryIndex =  context.categories.findIndex((obj => obj.id == context.parentData.transaction.category.id));
          store.accountabilities[previousAccountabilityIndex].transactions.splice(context.parentData.transactionIndex, 1);
          store.accountabilities[previousAccountabilityIndex].price -= context.parentData.transaction.price;  // Update Accountability Price
          context.categories[previousCategoryIndex].price -= context.parentData.transaction.price;            // Update Category Price
        }

              context.selectedAccountabilityIndex = store.accountabilities.findIndex((obj => obj.id == context.transaction.accountability.id));
              store.accountabilities[context.selectedAccountabilityIndex].transactions.push(context.transaction);  // Add Transaction
              store.accountabilities[context.selectedAccountabilityIndex].price += context.transaction.price;      // Update Accountability Price
              context.storage.set(storeURL, JSON.stringify(store));                                        // Update Accountability Storage

              context.selectedCategoryIndex = context.categories.findIndex((obj => obj.id == context.transaction.category.id));
              context.categories[context.selectedCategoryIndex].price += context.transaction.price;  // Update Category Price
              context.storage.set(context.parentData.CATEGORIES_KEY, JSON.stringify(context.categories)); //  Update Category Storage

              context.navCtrl.setRoot(HomeComponent, {
                tranasction: context.transaction
              });
              alert('Transaction Saved');
        }
      });
    }
  }

  /**
   * @description Function to get the Transaction bean
   * @returns {object} transaction object
   */
  getBean() {
    return {
      titlePlaceholder: 'Note',
      pricePlaceholder: 0,

      id: '',
      title: '',
      icon: 'assets/avatar/person.ico',   // TODO: Once App is working start to end, Provide facility to change icon per transaction.
      price: '',
      isActive: true,

      date: new Date(),
      category: null,
      accountability: {
        icon: 'assets/avatar/person.ico',
        title: 'Default Account'
      }
    }
  }

}
