export interface Purchase {
  group: string,
  address: string,
  reservation: string,
  profile: {
    name: string,
    email: string,
    phone: string
  }
}
