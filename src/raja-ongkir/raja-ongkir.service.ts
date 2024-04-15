import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { RajaOngkirAPI } from 'src/common/raja-ongkir';

@Injectable()
export class RajaOngkirService {
  private rajaOngkir: RajaOngkirAPI;

  constructor() {
    this.rajaOngkir = new RajaOngkirAPI();
  }

  async getProvinsi() {
    try {
      const rajaOngkirInstance = this.rajaOngkir.getInstance();
      console.log(rajaOngkirInstance);
      const response = await rajaOngkirInstance.get('/province');
      console.log(response);
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch province data from RajaOngkir API' + error,
      );
    }
  }

  async getCity(id: number, id_prov: number) {
    try {
      // const rajaOngkirInstance = this.rajaOngkir.getInstance();

      const response = await axios.get(
        `https://api.rajaongkir.com/starter/city?id=${id}&province=${id_prov}`,
        {
          headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
          },
        },
      );

      return response.data;
    } catch (err) {
      throw new Error('Failed to fetch city data from RajaOngkir API');
    }
  }

  async getCost(asal: string, tujuan: string, berat: number, courier: string) {
    try {
      const rajaOngkirInstance = this.rajaOngkir.getInstance();
      const response = await rajaOngkirInstance.post('/cost', {
        origin: asal,
        destination: tujuan,
        weight: berat,
        courier: courier,
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to get shipping cost from RajaOngkir API');
    }
  }
}
