import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { TransactionListComponent } from '../transaction-list/transaction-list.component';

import { Logger } from "../../common/log/logger.service";
import { UtilService } from "../../common/util/util.service";

import { AccountabilityService } from "./accountability.service";

@Component({
  selector: 'page-home',
  templateUrl: 'accountability.component.html'
})
export class AccountabilityComponent {

  /**
   * @description Data received from parent
   * @private 
   */
  private parentData: any = null;

  /**
  * @description item list to be displayed
  * @public 
  */
  public items: Array<any>;

  /**
  * @description Title of component
  * @public 
  */
   public title:string;

  /**
   * @description Sum of all the item's price
   * @public 
   */
   public totalAmount:number;

/**
  * @constructor 
  * @param {NavController} navCtrl - Navigation Controller
  * @param {NavParams} navParams - It is used to retrieve navigation parameters
  * @param {Storage} storage - Storage Service provided by Ionic
  * @param {Logger} logger - Logger Service
  * @param {Utility} utilService - Utility Service
  * @param {AccountabilityService} accountabilityService - AccountabilityService Service
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private logger: Logger,
    private utilService: UtilService,
    private accountabilityService: AccountabilityService) {

      this.parentData = navParams.get('parentData');
      this.loadData();
  }

  /**
   * @description Function to load the list of items and other data related to this component
   */
  loadData() {
    var context = this;

    if(!context.parentData ||
       !context.parentData.item ||
       !context.parentData.SEPARATOR ||
       !context.parentData.categoryId) {
        context.logger.error('AccountabilityComponent --> Error in retrieving parent data');
        return;
    }

    context.title = context.parentData.item.title;

    let storeURL = context.parentData.CATEGORIES_KEY +
                     context.parentData.SEPARATOR +
                     context.parentData.categoryId;

    context.storage.get(storeURL).then((store) => {

        //  When store value is '', convert it to null.
        store = (store !== '') ? JSON.parse(store): null;
        
        if (store === null || typeof store === 'undefined' ||
                typeof store.accountabilities === 'undefined') {  //  True: when no value is stored in storage
          context.logger.error('FATAL ERROR: Error in retriving Accountability List.');
          return; 
        } else {
          store.accountabilities.forEach(accountability => {
            if(accountability.icon_uri) {
              accountability.icon = this.utilService.getSanitizedUrl(accountability.icon_uri);
            }
          });
          context.items = store.accountabilities;
          context.items = context.utilService.sort(context.items, 'price', 'descending');
          context.totalAmount = context.utilService.getTotal(context.items, 'price');
        }
      });
    }

  /**
   * @description Function to load the Transaction List Page
   * @param item {Accountability Object} Selected object from Accountability List
   */
  loadTransactionListPage(selectedItem) {
    this.navCtrl.push(TransactionListComponent, {
       parentData: {
        item: selectedItem,
        thresholdLimit: this.accountabilityService.getThresholdLimit(this.parentData.categoryId),
        theme: this.parentData.theme,
        CATEGORIES_KEY: this.parentData.CATEGORIES_KEY,
        SEPARATOR: this.parentData.SEPARATOR
      }
    });
  }
}
