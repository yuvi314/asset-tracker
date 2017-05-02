import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { HomeComponent } from '../home/home.component';

import { LoggerService } from "../../common/log/logger.service";

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
   * @description Categories key. It is used to store and retrieve data from storage
   * @private 
   */
  private CATEGORIES_KEY: string = 'asset-tracker-store-categories';

  /**
   * @description Title of component
   * @private 
   */
  private title:string = 'Transaction Details';

  /**
   * @description Transaction object
   * @private 
   */
  private transaction:any;

  /**
   * @description list of categories
   * @private 
   */
  private categories:any[];

  /**
   * @description flag showing status of tranasction. true if transaction is new. i.e. true when -- > it is not update/delete tranasction
   * @private 
   */
  private isPristine:boolean; 


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
    private logger: LoggerService) {

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
    
    if (!context.parentData || !context.parentData.title ) {
      context.logger.error('TransactionComponent --> Error in retrieving parent data');
      return;
    }

     context.storage.get(context.CATEGORIES_KEY).then((storeData) => {
        if (storeData === null || typeof storeData === 'undefined') {  //  True: when no value is stored in storage
          context.logger.error('TransactionComponent --> Error in retrieving storage data');
          return;
        } else {
          context.categories = JSON.parse(storeData);
        }

        context.isPristine = (!context.parentData.item)? true:false;

        if (context.isPristine) {                 // Add new transaction
          context.transaction = context.getBean();
          context.transaction.category = context.categories[0];  // Set first category as default
        } else {                                 // update/delete existing transaction
          context.transaction = context.parentData.item;
        }
        context.title = context.parentData.title;

      });

    
  }

  /**
   * @description Function to save the Transaction
   */
  save() {
    alert('Transaction Saved');
    this.navCtrl.setRoot(HomeComponent, {
      tranasction: this.transaction
    });
  }


  /**
   * @description Function to get the Transaction bean
   * @returns {object} transaction object
   */
  getBean() {
    return {
      id: '',
      category: null,
      accountability: {
        icon: 'assets/avatar/person.ico',
        title:'Default Account'
      },
      price: 0,
      date: new Date()
    }
  }

}