import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutPageImageInfo } from './entities/about-page-image-info.entity';
import { CreateAboutPageImageInfoDto } from './dto/create-about-page-image-info.dto';

@Injectable()
export class AboutPageContentService {
  constructor(
    @InjectRepository(AboutPageImageInfo)
    private readonly imageInfoRepository: Repository<AboutPageImageInfo>,
  ) {}

  async createOrUpdate(
    createDto: CreateAboutPageImageInfoDto,
  ): Promise<AboutPageImageInfo> {
    let imageInfo = await this.imageInfoRepository.findOne({
      where: { imageSrc: createDto.imageSrc },
    });
    if (imageInfo) {
      if (createDto.description !== undefined) {
        imageInfo.description = createDto.description;
      } else if (imageInfo.description === undefined && createDto.description === undefined) {
        imageInfo.description = null;
      }
    } else {
      imageInfo = this.imageInfoRepository.create({
        imageSrc: createDto.imageSrc,
        description: createDto.description !== undefined ? createDto.description : null,
      });
    }
    return this.imageInfoRepository.save(imageInfo);
  }

  async findAll(): Promise<AboutPageImageInfo[]> {
    return this.imageInfoRepository.find();
  }

  async findOne(imageSrc: string): Promise<AboutPageImageInfo> {
    const imageInfo = await this.imageInfoRepository.findOne({
      where: { imageSrc },
    });
    if (!imageInfo) {
      throw new NotFoundException(
        `Information for image with src '${imageSrc}' not found`,
      );
    }
    return imageInfo;
  }

  async remove(imageSrc: string): Promise<void> {
    const result = await this.imageInfoRepository.delete({ imageSrc });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Information for image with src '${imageSrc}' not found`,
      );
    }
  }
} 