import { get, post, patch, del, put } from './api';

export interface Region {
    id: number;
    name: string;
    code: string;
    nerc_address: string;
    nerc_phone: string;
    remittance_account: string;
    is_active: boolean;
    created_at: string;
}
export interface RegionPayload {
    name: string;
    code: string;
    nerc_address: string;
    nerc_phone: string;
    remittance_account: string;
    is_active: boolean;
}
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export const getRegions = (
    search?: string,
    page: number = 1,
    pageSize: number = 10
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("page_size", String(pageSize));

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    return get<PaginatedResponse<Region>>(
        `/network/region/?${params.toString()}`
    );
};
export const getRegion = (regionId: number) => {
    return get<Region[]>(
        `/network/region/?region_id=${regionId}`
    );
};

export const createRegion = (payload: RegionPayload) => {
    return post<Region>("/network/region/", payload);
};
export const updateRegion = (payload: RegionPayload, regionId: number) => {
    return put<Region>(`/network/region/?region_id=${regionId}`, payload)
}

export const deleteRegion = (regionId: number) => {
    return del(`/network/region/?region_id=${regionId}`)
}

export interface BusinessUnit {
    id: number;
    name: string;
    code: string;
    region: Region;
    nerc_address: string;
    phone: string;
    remittance_account: string;
    is_active: boolean;
    created_at: string;
}
export interface BusinessUnitPayload {
    name: string;
    code: string;
    region: number;
    nerc_address: string;
    phone: string;
    remittance_account: string;
    is_active: boolean;
}
export const getBusinessUnits = (
    search?: string,
    page: number = 1,
    pageSize: number = 10
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("page_size", String(pageSize));

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    return get<PaginatedResponse<BusinessUnit>>(
        `/network/business-unit/?${params.toString()}`
    );
};

export const getBusinessUnit = (businessUnitId: number, regionId: number) => {
    return get<BusinessUnit>(
        `/network/business-unit/?business_unit_id=${businessUnitId}&region_id=${regionId}`
    );
};
export const createBusinessUnit = (payload: BusinessUnitPayload) => {
    return post<BusinessUnit>("/network/business-unit/", payload);
};

export const updateBusinessUnit = (payload: BusinessUnitPayload, businessUnitId: number) => {
    return put<BusinessUnit>(`/network/business-unit/?business_unit_id=${businessUnitId}`, payload)
}
export const deleteBusinessUnit = (businessUnitId: number) => {
    return del(`/network/business-unit/?business_unit_id=${businessUnitId}`)
}

export interface ServiceUnit {
    id: number;
    name: string;
    code: string;
    business_unit: BusinessUnit;
    is_active: boolean;
    created_at: string;
}

export interface ServiceUnitPayload {
    name: string;
    code: string;
    business_unit: number;
    is_active: boolean;
}
export const getServiceUnits = (
    search?: string,
    page: number = 1,
    pageSize: number = 10
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("page_size", String(pageSize));

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    return get<PaginatedResponse<ServiceUnit> | ServiceUnit[]>(
        `/network/service-unit/?${params.toString()}`
    );
};
export const getServiceUnitsByBusinessUnit = (
    businessUnitId: number,
    search?: string
) => {
    const params = new URLSearchParams();

    params.append(
        "business_unit_id",
        String(businessUnitId)
    );

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    return get<
        PaginatedResponse<ServiceUnit> | ServiceUnit[]
    >(
        `/network/service-unit/?${params.toString()}`
    );
};

export const getServiceUnit = (serviceUnitId: number) => {
    return get<ServiceUnit>(
        `/network/service-unit/?service_unit_id=${serviceUnitId}`
    );
}
export const createServiceUnit = (payload: ServiceUnitPayload) => {
    return post<ServiceUnit>("/network/service-unit/", payload);
}
export const updateServiceUnit = (payload: ServiceUnitPayload, serviceUnitId: number) => {
    return put<ServiceUnit>(`/network/service-unit/?service_unit_id=${serviceUnitId}`, payload)
}
export const deleteServiceUnit = (serviceUnitId: number) => {
    return del(`/network/service-unit/?service_unit_id=${serviceUnitId}`)
}
export interface ServiceCenter {
    id: number;
    name: string;
    code: string;
    service_unit: ServiceUnit;
    business_unit: string;
    region: string;
    address: string;
    is_active: boolean;
    created_at: string;
}
export interface ServiceCenterPayload {
    name: string;
    code: string;
    service_unit: number;
    address: string;
    is_active: boolean;
}

export const getServiceCenters = (
    search?: string,
    page: number = 1,
    pageSize: number = 10,
    serviceUnitId?: number,
    businessUnitId?: number
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("page_size", String(pageSize));

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    if (serviceUnitId) {
        params.append(
            "service_unit_id",
            String(serviceUnitId)
        );
    }

    if (businessUnitId) {
        params.append(
            "business_unit_id",
            String(businessUnitId)
        );
    }

    return get<PaginatedResponse<ServiceCenter> | ServiceCenter[]>(
        `/network/service-center/?${params.toString()}`
    );
};

export const getServiceCenter = (serviceCenterId: number) => {
    return get<ServiceCenter>(
        `/network/service-center/?service_center_id=${serviceCenterId}`
    );
}

export const createServiceCenter = (payload: ServiceCenterPayload) => {
    return post<ServiceCenter>("/network/service-center/", payload);
}

export const updateServiceCenter = (payload: ServiceCenterPayload, serviceCenterId: number) => {
    return put<ServiceCenter>(`/network/service-center/?service_center_id=${serviceCenterId}`, payload)
}

export const deleteServiceCenter = (serviceCenterId: number) => {
    return del(`/network/service-center/?service_center_id=${serviceCenterId}`)
}

export interface Substation {
    id: number;
    name: string;
    code: string;
    address: string;
    is_active: boolean;
    created_at: string;
}
export interface SubstationPayload {
    name: string;
    code: string;
    address: string;
    is_active: boolean;
}

export const getSubstations = (
    search?: string,
    page: number = 1,
    pageSize: number = 10
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("page_size", String(pageSize));

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    return get<
        PaginatedResponse<Substation> | Substation[]
    >(
        `/network/substation/?${params.toString()}`
    );
};
export const getSubstation = (substationId: number) => {
    return get<Substation>(
        `/network/substation/?substation_id=${substationId}`
    );
};
export const createSubstation = (payload: SubstationPayload) => {
    return post<Substation>("/network/substation/", payload);
}
export const updateSubstation = (payload: SubstationPayload, substationId: number) => {
    return put<Substation>(`/network/substation/?substation_id=${substationId}`, payload)
}
export const deleteSubstation = (substationId: number) => {
    return del(`/network/substation/?substation_id=${substationId}`)
}
export interface Parent {
    id: number;
    name: string;
    code: string;
    voltage_level: number;
}

export interface Feeder {
    id: number;
    name: string;
    code: string;
    voltage_level: number;
    parent: Parent | null;
    substation: Substation;
    business_unit: string;
    band: string;
    band_id: number;
    status: "active" | "inactive";
    is_automated: boolean;
    transformer_count: number;
    is_active: boolean;
    created_at: string;
}

export interface FeederPayload {
    name: string;
    code: string;
    voltage_level: number;
    parent: number | null;
    substation: number;
    business_unit: number;
    band: number;
    status: "active" | "inactive";
    is_automated: boolean;
    is_active: boolean;
}
export const getFeeders = (
    search?: string,
    page: number = 1,
    pageSize: number = 10,
    bandId?: number,
    businessUnitId?: number,
    feederId?: number,
    parentId?: number,
    substationId?: number,
    voltage_level?: number,
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("page_size", String(pageSize));

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    if (bandId) {
        params.append(
            "band_id",
            String(bandId)
        );
    }

    if (businessUnitId) {
        params.append(
            "business_unit_id",
            String(businessUnitId)
        );
    }
    if (feederId) {
        params.append(
            "feeder_id",
            String(feederId)
        );
    }
    if (parentId) {
        params.append(
            "parent_id",
            String(parentId)
        );
    }
    if (substationId) {
        params.append(
            "substation_id",
            String(substationId)
        );
    }
    if (voltage_level) {
        params.append(
            "voltage_level",
            String(voltage_level)
        );
    }
    return get<PaginatedResponse<Feeder> | Feeder[]>(
        `/network/feeder/?${params.toString()}`
    );
};
export const getFeeder = (feederId: number) => {
    return get<Feeder>(
        `/network/feeder/?feeder_id=${feederId}`
    );
};
export const createFeeder = (payload: FeederPayload) => {
    return post<Feeder>('/network/feeder/', payload)
}
export const updateFeeder = (payload: FeederPayload, feederId: number) => {
    return put<Feeder>(`/network/feeder/?feeder_id=${feederId}`, payload)
}
export const deleteFeeder = (feererId: number) => {
    return del(`/network/feeder/?feeder_id=${feererId}`)
}

export interface Feeder2 {
    id: number;
    name: string;
    code: string;
    voltage_level: number;
}

export interface Transformer {
    id: number;
    name: string;
    code: string;
    feeder: Feeder2;
    band: string;
    schedule: "lsh" | "metered" | "nlsh";
    status: "active" | "inactive";
    address: string;
    is_active: boolean;
    created_at: string;
}

export interface TransformerPayload {
    name: string;
    code: string;
    feeder: number;
    schedule: "lsh" | "metered" | "nlsh";
    status: "active" | "inactive";
    address: string;
    is_active: boolean;
}
export const getTransformers = (
    search?: string,
    page: number = 1,
    pageSize: number = 10,
    transformerId?: number,
    feederId?: number,
    schedule?: "lsh" | "metered" | "nlsh"
) => {

    const params = new URLSearchParams();

    params.append(
        "page",
        String(page)
    );

    params.append(
        "page_size",
        String(pageSize)
    );
    if (search?.trim()) {

        params.append(
            "search",
            search.trim()
        );

    }
    if (transformerId) {

        params.append(
            "transformer_id",
            String(transformerId)
        );

    }
    if (feederId) {

        params.append(
            "feeder_id",
            String(feederId)
        );

    }
    if (schedule) {

        params.append(
            "schedule",
            schedule
        );

    }
    return get<
        PaginatedResponse<Transformer>
        | Transformer[]
    >(
        `/network/transformer/?${params.toString()}`
    );

};
export const getTransformer = (transformerId: number) => {
    return get<Transformer>(
        `/network/transformer/?transformer_id=${transformerId}`
    );
}
export const createTransformer = (payload: TransformerPayload) => {
    return post<Transformer>("/network/transformer/", payload);
}
export const updateTransformer = (payload: TransformerPayload, transformerId: number) => {
    return put<Transformer>(`/network/transformer/?transformer_id=${transformerId}`, payload)
}
export const deleteTransformer = (transformerId: number) => {
    return del(`/network/transformer/?transformer_id=${transformerId}`)
}

export interface Band {
    id: number;
    name: string;
    category: string;
    description: string;
    baseline_hours: string;
    is_active: boolean;
    feeder_count: number;
    created_at: string;
}
export interface BandPayload {
    name: string;
    category: string;
    description: string;
    baseline_hours: string;
    is_active: boolean;
}
export const getBands = (
    search?: string,
    page: number = 1,
    pageSize: number = 100
) => {

    const params = new URLSearchParams();

    params.append(
        "page",
        String(page)
    );

    params.append(
        "page_size",
        String(pageSize)
    );


    if (search?.trim()) {

        params.append(
            "search",
            search.trim()
        );

    }


    return get<
        PaginatedResponse<Band> | Band[]
    >(
        `/tariff/band/?${params.toString()}`
    );

};
export const getBand = (bandId: number) => {
    return get<Band>(
        `/tariff/band/?band_id=${bandId}`
    );
};
export const createBand = (payload: BandPayload) => {
    return post<Band>("/tariff/band/", payload);
};
export const updateBand = (payload: BandPayload, bandId: number) => {
    return put<Band>(`/tariff/band/?band_id=${bandId}`, payload);
};
export const deleteBand = (bandId: number) => {
    return del(`/tariff/band/?band_id=${bandId}`);
};

export interface TariffCategory {
    id: number;
    name: string;
    legacy_name: string;
    is_active: boolean;
    created_at: string;
}
export interface TariffCategoryPayload {
    name: string;
    legacy_name: string;
    is_active: boolean;
}
export const getTariffCategories = (
    search?: string,
    page: number = 1,
    pageSize: number = 100
) => {
    const params = new URLSearchParams();

    params.append(
        "page",
        String(page)
    );
    params.append(
        "page_size",
        String(pageSize)
    );
    if (search?.trim()) {
        params.append(
            "search",
            search.trim()
        );
    }
    return get<
        PaginatedResponse<TariffCategory> | TariffCategory[]
    >(
        `/tariff/category/?${params.toString()}`
    );
};

export const getTariffCategory = (categoryId: number) => {
    return get<TariffCategory>(
        `/tariff/category/?category_id=${categoryId}`
    );
}

export const createTariffCategory = (payload: TariffCategoryPayload) => {
    return post<TariffCategory>("/tariff/category/", payload);
}
export const updateTariffCategory = (payload: TariffCategoryPayload, categoryId: number) => {
    return put<TariffCategory>(`/tariff/category/?category_id=${categoryId}`, payload)
}
export const deleteTariffCategory = (categoryId: number) => {
    return del(`/tariff/category/?category_id=${categoryId}`)
}

export interface CloseTariffPayload {
    effective_to: string;
}
export interface Tariff {
    id: number;
    name: string;
    band: Band;
    category: TariffCategory;
    metering_type: string;
    rate: string;
    tariff_index: string;
    effective_from: string;
    effective_to: string | null;
    is_current: boolean;
    created_at: string;
}
export interface TariffPayload {
    band: number;
    category: number;
    metering_type: number;
    name: string;
    rate: string;
    tariff_index: string;
    effective_from: string;
    effective_to?: string | null;
}
export const getTariffs = (
    search?: string,
    page: number = 1,
    pageSize: number = 100,
    bandId?: number,
    categoryId?: number,
    meteringTypeId?: number,
    current?: boolean,
    tariffId?: number
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));

    params.append(
        "page_size",
        String(pageSize)
    );

    if (search?.trim()) {
        params.append(
            "search",
            search.trim()
        );
    }

    if (bandId) {
        params.append(
            "band_id",
            String(bandId)
        );
    }

    if (categoryId) {
        params.append(
            "category_id",
            String(categoryId)
        );
    }

    if (meteringTypeId) {
        params.append(
            "metering_type_id",
            String(meteringTypeId)
        );
    }

    if (current !== undefined) {
        params.append(
            "current",
            String(current)
        );
    }

    if (tariffId) {
        params.append(
            "tariff_id",
            String(tariffId)
        );
    }

    return get<
        PaginatedResponse<Tariff> | Tariff[]
    >(`/tariff/?${params.toString()}`);
};
export const getTariff = (tariffId: number) => {
    return get<Tariff>(`/tariff/?tariff_id=${tariffId}`)
}
export const createTariff = (payload: TariffPayload) => {
    return post<Tariff>('/tariff/', payload)
}
export const updateTariff = (payload: TariffPayload, tariffId: number) => {
    return put<Tariff>(`/tariff/?tariff_id=${tariffId}`, payload)
}
export const deleteTariff = (tariffId: number) => {
    return del(`/tariff/?tariff_id=${tariffId}`)
}

export const closeTariff = (
    tariffId: number,
    payload: CloseTariffPayload
) => {
    return post<Tariff>(
        `/tariff/close/?tariff_id=${tariffId}`,
        payload
    );
};

export interface MeterMake {
    id: number;
    name: string;
    created_at: string;
}
export interface MeterMakePayload {
    name: string;
}
export const getMeterMakes = (
    search?: string,
    page: number = 1,
    pageSize: number = 100
) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("page_size", String(pageSize));

    if (search?.trim()) {
        params.append("search", search.trim());
    }

    return get<
        PaginatedResponse<MeterMake> | MeterMake[]
    >(`/meter/make/?${params.toString()}`);
};


export const getMeterMake = (
    makeId: number
) => {
    return get<MeterMake>(
        `/meter/make/?meter_make_id=${makeId}`
    );
};


export const createMeterMake = (
    payload: MeterMakePayload
) => {
    return post<MeterMake>(
        "/meter/make/",
        payload
    );
};


export const updateMeterMake = (
    payload: MeterMakePayload,
    makeId: number
) => {
    return put<MeterMake>(
        `/meter/make/?meter_make_id=${makeId}`,
        payload
    );
};


export const deleteMeterMake = (
    makeId: number
) => {
    return del(
        `/meter/make/?meter_make_id=${makeId}`
    );
};
export type MeterAction =
  | "installed"
  | "assigned"
  | "unassigned"
  | "disconnected"
  | "reconnected"
  | "replaced"
  | "retired"
  | "received";

export interface MeterLine {
    id: number;
    meter: number;
    meter_number: string;
    customer: number;
    customer_name: string;
    related_meter: number;
    related_meter_number: string;
    action: MeterAction;
    reading: string;
    reason: string;
    notes: string;
    performed_by: number;
    performed_by_name: string;
    occurred_at: string;
    created_at: string;
}

export interface MeterLinePayload {
  meter: number;
  customer?: number;
  related_meter?: number;
  reading: string;
  related_reading?: string;
  action: MeterAction;
  reason: string;
  notes: string;
  occurred_at: string;
}
export const getMeterLines = (
    search?: string,
    page: number = 1,
    pageSize: number = 100,
    meterId?: number,
    customerId?: number,
    action?: MeterAction
) => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
    if (search?.trim()) {
        params.append("search", search.trim());
    }
    if (meterId) {
        params.append("meter_id", String(meterId));
    }
    if (customerId) {
        params.append("customer_id", String(customerId));
    }
    if (action) {
        params.append("action", action);
    }
    return get<
        PaginatedResponse<MeterLine> | MeterLine[]
    >(`/meter/line/?${params.toString()}`);
};

export const getMeterLine = (lineId: number) => {
    return get<MeterLine>(
        `/meter/line/?meter_line_id=${lineId}`
    );
}
export const createMeterLine = (payload: MeterLinePayload) => {
    return post<MeterLine>("/meter/line/", payload);
}

export interface Meter {
  id: number;
  meter_number: string;
  legacy_id: number;
  customer: number | null;
  customer_name: string;
  customer_account_number: string;
  metering_type: "prepaid" | "postpaid";
  sgc: string;
  ti: string;
  krn: string;
  kct1: string;
  kct2: string;
  meter_make: MeterMake;
  communication: "STS";
  units: "kWh";
  phases: string;
  multiplicity: string;
  number_of_digits: number;
  initial_reading: string;
  status: "active" | "inactive";
  is_disconnected: boolean;
  installation_date: string;
  is_vendable: boolean;
  price: string;
  latitude: string;
  longitude: string;
  created_at: string;
}
export interface MeterPayload {
  meter_number: string;
  customer: number;
  metering_type: "prepaid" | "postpaid";
  sgc: string;
  ti: string;
  krn: string;
  kct1: string;
  kct2: string;
  meter_make: number;
  communication: "STS";
  units: "kWh";
  phases: string;
  multiplicity: string;
  number_of_digits: number;
  initial_reading: string;
  status: "active" | "inactive";
  is_disconnected: boolean;
  installation_date: string;
  price: string;
  latitude: string;
  longitude: string;
  reason: string;
  reading: string;
  occurred_at: string;
  notes: string;
}
export const getMeters = (
    search?: string,
    page: number = 1,
    pageSize: number = 100
) => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
    if (search?.trim()) {
        params.append("search", search.trim());
    }
    return get<
        PaginatedResponse<Meter> | Meter[]
    >(`/meter/?${params.toString()}`);
};

export const getMeter = (meterId: number) => {
    return get<Meter>(
        `/meter/?meter_id=${meterId}`
    );
}

export const createMeter = (payload: MeterPayload) => {
    return post<Meter>("/meter/", payload);
}

export const updateMeter = (payload: MeterPayload, meterId: number) => {
    return put<Meter>(`/meter/?meter_id=${meterId}`, payload);
}

export const deleteMeter = (meterId: number) => {
    return del(`/meter/?meter_id=${meterId}`);
}

